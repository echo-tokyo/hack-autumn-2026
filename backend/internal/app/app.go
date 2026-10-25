// Package app provides object with Run method to start full application.
package app

import (
	"context"
	"fmt"
	"log"
	"log/slog"
	"os"
	"os/signal"
	"sync"
	"syscall"

	"backend/config"
	"backend/internal/app/service/notifier"
	"backend/internal/app/service/occurrence"
	"backend/internal/app/service/server"
	"backend/internal/pkg/cache"
	"backend/internal/pkg/db"
	"backend/internal/pkg/logger"
	"backend/internal/pkg/telegram"
	"backend/internal/pkg/validator"

	"github.com/shopspring/decimal"
)

// Ensure server implements interface.
var _ Service = (*server.Server)(nil)

// Service describes app service started in parallel with other similar services.
type Service interface {
	// Started returns chan that signals that service's readiness.
	Started() <-chan struct{}
	// Exited returns chan that signals that service's exited.
	Exited() <-chan struct{}
	// Run starts service. Waits to context done to exit.
	Run(ctx context.Context, errChan chan<- error)
}

// App represents full application with services.
type App struct {
	cfg      *config.Config
	services []Service
}

// NewApp returns a new instance of [App] with services to start HTTP-server.
func NewApp() (*App, error) {
	decimal.MarshalJSONWithoutQuotes = true

	// load config
	cfg, err := config.New()
	if err != nil {
		return nil, fmt.Errorf("create config: %w", err)
	}

	// setup logger
	logger.InitSlog(
		logger.WithLogLevel(cfg.App.Logging.LogLevel),
		logger.WithFormat(cfg.App.Logging.LogFormat),
		logger.WithLocale(cfg.Timezone),
	)
	// print out config params in debug log mode
	slog.Debug("current config", "config", cfg)

	// init validator
	valid, err := validator.NewRuTagValidator()
	if err != nil {
		return nil, fmt.Errorf("validator: %w", err)
	}

	// connect to DB
	dbStorage, err := db.New(cfg.DB.DSN,
		db.WithTranslateError(),
		db.WithIgnoreNotFound(),
		db.WithDisableColorful(),
		db.WithLogLevel(cfg.DB.Logging.LogLevel),
		db.WithLogger(log.Default()))
	if err != nil {
		return nil, fmt.Errorf("db: %w", err)
	}
	// init cache storage
	cacheStorage := cache.NewInMem()
	// init tg client
	tgClient, err := telegram.New(cfg.Telegram.BotToken, cfg.Telegram.ChatID)
	if err != nil {
		return nil, fmt.Errorf("tg client: %w", err)
	}

	// init server service
	srv, err := server.New(cfg, dbStorage, cacheStorage, valid)
	if err != nil {
		return nil, fmt.Errorf("create server service: %w", err)
	}
	// init occurrence service
	occ := occurrence.New(cfg, dbStorage)
	ntfy, err := notifier.New(cfg, dbStorage, tgClient)
	if err != nil {
		return nil, fmt.Errorf("create notify service: %w", err)
	}

	return &App{
		cfg:      cfg,
		services: []Service{srv, occ, ntfy},
	}, nil
}

// Run starts app. This function is blocking.
// It waits for os signal to gracefully shutdown.
func (a *App) Run() (appErr error) {
	// ctx for app services
	appContext, cancel := context.WithCancel(context.Background())
	defer cancel()

	// handle shutdown process signals
	quitSig := make(chan os.Signal, 1)
	signal.Notify(quitSig,
		syscall.SIGHUP,
		syscall.SIGINT,
		syscall.SIGTERM,
		syscall.SIGQUIT,
	)

	// wait groups to sync starting/exiting all services
	var wgStarted, wgExited sync.WaitGroup

	// start services
	serviceErr := make(chan error, 1)
	for _, service := range a.services {
		wgStarted.Go(func() {
			<-service.Started()
		})
		wgExited.Go(func() {
			<-service.Exited()
		})
		go service.Run(appContext, serviceErr)
	}

	wgStarted.Wait()
	select {
	case handledSignal := <-quitSig:
		cancel()
		slog.Warn("got os signal; shutdown app...", "signal", handledSignal.String())
	case err := <-serviceErr:
		cancel()
		appErr = fmt.Errorf("service: %w", err)
		slog.Warn("one of services fell down; shutdown app...")
	case <-appContext.Done():
		appErr = appContext.Err()
		slog.Warn("context canceled; shutdown app...")
	}
	wgExited.Wait()
	slog.Info("all services exited")
	return appErr
}
