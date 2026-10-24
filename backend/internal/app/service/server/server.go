// Package server provides HTTP-server service.
package server

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net"
	"net/http"
	"time"

	fiber "github.com/gofiber/fiber/v2"

	"backend/config"
	"backend/internal/app/service/server/errhandler"
	"backend/internal/app/service/server/middleware"
	"backend/internal/pkg/cache"
	"backend/internal/pkg/db"
	"backend/internal/pkg/validator"
)

const (
	_bodyLimit    = 10 * 1024 * 1024  // 10 MB - control on Nginx
	_readTimeout  = 300 * time.Second // control on Nginx
	_writeTimeout = 300 * time.Second // control on Nginx
)

// Server represents a HTTP-server.
type Server struct {
	cfg      *config.Config
	fiberApp *fiber.App

	started chan struct{}
	exited  chan struct{}
}

// @title						Invoice Keeper API
// @version					1.0.0
// @description				HTTP API Invoice Keeper (напоминания о регулярных платежах).
//
// @host						127.0.0.1:8080
// @basePath					/api/v1
// @schemes					http
//
// @accept						json
// @produce					json
//
// @securityDefinitions.apiKey	JWTRefresh
// @in							cookie
// @name						refresh
// @description				Refresh JWT-token. Cookie will automatic add after auth is done.
//
// @securitydefinitions.apikey	JWTAccess
// @in							cookie
// @name						access
// @description				Access JWT-token. Cookie will automatic add after auth is done.
func New(cfg *config.Config, dbStorage *db.DB, cacheStorage cache.Storage,
	valid validator.Validator) (*Server, error) {

	// fiber init
	server := &Server{
		cfg: cfg,
		fiberApp: fiber.New(fiber.Config{
			ServerHeader:  "Invoice Keeper",
			StrictRouting: false,
			ErrorHandler:  errhandler.CustomErrorHandler,
			BodyLimit:     _bodyLimit,
			ReadTimeout:   _readTimeout,
			WriteTimeout:  _writeTimeout,
		}),
		started: make(chan struct{}),
		exited:  make(chan struct{}),
	}

	// set up base middlewares
	server.fiberApp.Use(middleware.Logger(
		middleware.LoggerWithLevel(cfg.App.Logging.LogLevel),
		middleware.LoggerWithFormat(cfg.App.Logging.LogFormat),
		middleware.LoggerWithLocale(cfg.Timezone)))
	server.fiberApp.Use(middleware.Recover())
	server.fiberApp.Use(middleware.CORS(cfg.CORS.AllowedOrigins, cfg.CORS.AllowedMethods,
		cfg.CORS.AllowCredentials))
	server.fiberApp.Use(middleware.Swagger())
	// register all endpoints
	server.registerEndpointsV1(cfg, dbStorage, cacheStorage, valid)

	return server, nil
}

// Run starts server and waits for
// context is done for gracefully shutdown server.
// This method is blocking.
func (s *Server) Run(ctx context.Context, errChan chan<- error) {
	slog.Info("start http-server service...")

	// start server
	go s.listenAndServe(errChan)
	defer close(s.exited)
	// wait for context
	<-ctx.Done()
	if err := s.fiberApp.ShutdownWithTimeout(s.cfg.Server.ShutdownTimeout); err != nil {
		errChan <- fmt.Errorf("server: shutdown: %w", err)
	}
}

// Started returns chan that signals the service's readiness.
func (s *Server) Started() <-chan struct{} {
	return s.started
}

// Exited returns chan that signals that service's exited.
func (s *Server) Exited() <-chan struct{} {
	return s.exited
}

// listenAndServe starts HTTP-server and serve incomming connections.
func (s *Server) listenAndServe(errChan chan<- error) {
	addr := "0.0.0.0:" + s.cfg.Server.Port

	// listen port
	listener, err := net.Listen("tcp", addr) //nolint:noctx // ListenConfig is not necessary
	if err != nil && !errors.Is(err, http.ErrServerClosed) {
		errChan <- fmt.Errorf("start server listener: %w", err)
		return
	}
	close(s.started)

	slog.Info("listener started successfully", "addr", addr)
	if err := s.fiberApp.Listener(listener); err != nil {
		errChan <- fmt.Errorf("server: listen: %w", err)
	}
}
