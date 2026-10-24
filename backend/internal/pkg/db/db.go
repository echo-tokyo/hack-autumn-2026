// Package db provides *gorm.DB for interaction with the database through GORM methods.
package db

import (
	"fmt"
	"log"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

const (
	_infoLevel   = logger.Info   // debug log level
	_warnLevel   = logger.Warn   // warn log level
	_errorLevel  = logger.Error  // error log level
	_silentLevel = logger.Silent // silent log level
)

// _logLevels is a matched general log levels and db log levels.
var _logLevels = map[int]logger.LogLevel{
	2: logger.Info,   // info
	3: logger.Warn,   // warn
	4: logger.Error,  // error
	5: logger.Silent, // silent
}

// Logger is an internal interface compatible with a gorm logger.Writer.
// It is used to configure a custom *gorm.DB logger.
type Logger interface {
	Printf(format string, args ...any)
}

// dbSettings represents custom options to create *gorm.DB.
type dbSettings struct {
	customLogger    Logger
	logLevel        logger.LogLevel
	translateError  bool
	ignoreNotFound  bool
	disableColorful bool
	timezone        *time.Location
}

// Option represents an option for DB initializing.
type Option func(*dbSettings)

type DB struct {
	*gorm.DB
}

// New returns a new instance of DB with connection to given DSN.
// Options can be set with "With..." funcs.
func New(dsn string, options ...Option) (*DB, error) {
	dbStorage := &dbSettings{
		customLogger:    log.Default(),
		logLevel:        _warnLevel,
		translateError:  false,
		ignoreNotFound:  false,
		disableColorful: false,
		timezone:        time.UTC,
	}

	// apply all options to customize DB struct
	for _, opt := range options {
		opt(dbStorage)
	}

	gormDB, err := gorm.Open(
		withConn(dsn),
		&gorm.Config{
			// set time zone
			NowFunc: func() time.Time {
				return time.Now().In(dbStorage.timezone)
			},
			Logger: logger.New(
				dbStorage.customLogger,
				logger.Config{
					LogLevel:                  dbStorage.logLevel,
					IgnoreRecordNotFoundError: dbStorage.ignoreNotFound,
					Colorful:                  !dbStorage.disableColorful,
				},
			),
			TranslateError: dbStorage.translateError,
		},
	)
	if err != nil {
		return nil, fmt.Errorf("open db connection: %w", err)
	}

	dbStorage.customLogger.Printf("successfully connected to db")
	return &DB{gormDB}, nil
}

// withConn sets connection for DB. Required.
// There is the MySQL is used as DB.
func withConn(dsn string) gorm.Dialector {
	return postgres.Open(dsn)
}

// WithLogger sets custom logger for DB.
func WithLogger(customLogger Logger) Option {
	return func(d *dbSettings) {
		d.customLogger = customLogger
	}
}

// WithLogLevel sets log level for DB.
// Accepted values: 2 - info, 3 - warn (default), 4 - error, 5 - silent.
func WithLogLevel(logLevel int) Option {
	var level logger.LogLevel
	var ok bool
	if level, ok = _logLevels[logLevel]; !ok {
		// if log level not found in logLevels map (default level is warn)
		level = _warnLevel
	}
	return func(d *dbSettings) {
		d.logLevel = level
	}
}

// WithTranslateError sets translate error parameter true.
func WithTranslateError() Option {
	return func(d *dbSettings) {
		d.translateError = true
	}
}

// WithIgnoreNotFound sets ignore record not found error parameter true.
func WithIgnoreNotFound() Option {
	return func(d *dbSettings) {
		d.ignoreNotFound = true
	}
}

// WithDisableColorful sets colorful log output false.
func WithDisableColorful() Option {
	return func(d *dbSettings) {
		d.disableColorful = true
	}
}

// WithTimezone sets timezone for logger.
func WithTimezone(timezone *time.Location) Option {
	return func(d *dbSettings) {
		d.timezone = timezone
	}
}
