// Package config provides loading config data from external sources
// like env variables, yaml-files etc.
package config

import (
	"backend/internal/pkg/password"
	"fmt"
	"time"
	_ "time/tzdata" // compressed tz data to don't depend on system files

	"github.com/ilyakaznacheev/cleanenv"
)

var (
	_defDB = DB{
		Host: "127.0.0.1",
		Port: "5432",
		Logging: Logging{
			LogLevel: 3, //nolint:mnd // default level (warn)
		},
	}
	_defLogging = Logging{
		LogLevel:  2, //nolint:mnd // default level (info)
		LogFormat: "text",
	}
	_defCookie = Cookie{
		Path:     "",
		Secure:   false,
		HTTPOnly: false,
		SameSite: "",
	}
	_defAccessToken = AccessToken{
		TTL:    30 * time.Minute, // default access token ttl (30 minutes)
		Cookie: _defCookie,
	}
	_defRefreshToken = RefreshToken{
		TTL:    24 * time.Hour, // default access token ttl (1 day)
		Cookie: _defCookie,
	}
	_defAuth = Auth{
		AccessToken:  _defAccessToken,
		RefreshToken: _defRefreshToken,
	}
	_defCORS = CORS{
		AllowedOrigins:   "*",
		AllowedMethods:   "GET",
		AllowCredentials: false,
	}
	_defServer = Server{
		Port:            "80",
		ShutdownTimeout: time.Minute,
		CORS:            _defCORS,
		Auth:            _defAuth,
	}
	_defTelegram = Telegram{
		ReminderLeadDays: 3,
		Interval:         24 * time.Hour,
	}
	_defApp = App{
		TimezoneName: "UTC",
		Logging:      _defLogging,
		Server:       _defServer,
		Telegram:     _defTelegram,
	}
	_defConfig = Config{
		DB:  _defDB,
		App: _defApp,
	}
)

type (
	Config struct {
		DB  `yaml:"db"`
		App `yaml:"app"`
	}

	DB struct {
		User     string `env-required:"true" env:"POSTGRES_USER"`
		Password string `env-required:"true" env:"POSTGRES_PASSWORD"`
		Name     string `env-required:"true" env:"POSTGRES_DB"`
		Host     string `yaml:"host"`
		Port     string `yaml:"port"`
		DSN      string `yaml:"-"`
		Logging  `yaml:"logging"`
	}

	App struct {
		TimezoneName string         `env-required:"true" env:"TIMEZONE"`
		Timezone     *time.Location `yaml:"-" json:"-"`
		Logging      `yaml:"logging"`
		Server       `yaml:"server"`
		Admin
		Telegram
	}

	Logging struct {
		LogLevel  int    `yaml:"log_level"`
		LogFormat string `yaml:"log_format"`
	}

	Server struct {
		Port            string        `yaml:"port"`
		ShutdownTimeout time.Duration `yaml:"shutdown_timeout"`
		CORS            `yaml:"cors"`
		Auth            `yaml:"auth"`
	}

	CORS struct {
		AllowedOrigins   string `yaml:"allowed_origins"`
		AllowedMethods   string `yaml:"allowed_methods"`
		AllowCredentials bool   `yaml:"allow_credentials"`
	}

	Auth struct {
		AccessToken  AccessToken  `yaml:"access_token"`
		RefreshToken RefreshToken `yaml:"refresh_token"`
	}

	AccessToken struct {
		Secret []byte        `env-required:"true" env:"ACCESS_SECRET" json:"-"`
		TTL    time.Duration `yaml:"ttl"`
		Cookie Cookie        `yaml:"cookie"`
	}

	RefreshToken struct {
		Secret []byte        `env-required:"true" env:"REFRESH_SECRET"`
		TTL    time.Duration `yaml:"ttl"`
		Cookie Cookie        `yaml:"cookie"`
	}

	Cookie struct {
		Path     string `yaml:"path"`
		Secure   bool   `yaml:"secure"`
		HTTPOnly bool   `yaml:"http_only"`
		SameSite string `yaml:"same_site"`
	}

	Admin struct {
		Username    string `env-required:"true" env:"ADMIN_USERNAME"`
		PasswordRaw []byte `env-required:"true" env:"ADMIN_PASSWORD" json:"-"`
		Password    []byte `json:"-"`
	}

	Telegram struct {
		BotToken         string        `env-required:"true" env:"TELEGRAM_BOT_TOKEN"`
		ChatID           int64         `env-required:"true" env:"TELEGRAM_CHAT_ID"`
		ReminderLeadDays int           `yaml:"reminder_lead_days"`
		Interval         time.Duration `yaml:"reminder_interval"`
	}
)

// New returns app config loaded from YAML-file.
func New() (*Config, error) {
	// use default values
	cfg := &_defConfig

	// read YAML config file
	if err := cleanenv.ReadConfig("./config.yml", cfg); err != nil {
		return nil, fmt.Errorf("read yaml config file: %w", err)
	}
	// read ENV variables
	if err := cleanenv.ReadEnv(cfg); err != nil {
		return nil, fmt.Errorf("read env-variables: %w", err)
	}

	// parse timezone name
	timezone, err := time.LoadLocation(cfg.App.TimezoneName)
	if err != nil {
		return nil, fmt.Errorf("parse timezone name: %w", err)
	}
	cfg.App.Timezone = timezone

	// hash admin password
	cfg.Admin.Password, err = password.Encode(cfg.Admin.PasswordRaw)
	if err != nil {
		return nil, fmt.Errorf("hash admin password: %w", err)
	}

	// collect DSN string
	cfg.DB.DSN = fmt.Sprintf(
		"user=%s password=%s host=%s port=%s dbname=%s timezone=%s",
		cfg.DB.User,
		cfg.DB.Password,
		cfg.DB.Host,
		cfg.DB.Port,
		cfg.DB.Name,
		cfg.Timezone.String(),
	)
	return cfg, nil
}
