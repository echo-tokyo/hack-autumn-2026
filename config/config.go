// Package config provides loading config data from external sources
// like env variables, yaml-files etc.
package config

import (
	"fmt"
	"time"
	_ "time/tzdata" // compressed tz data to don't depend on system files

	"github.com/ilyakaznacheev/cleanenv"
)

var (
	_defDB = DB{
		Name: "syspodhot",
		Host: "127.0.0.1",
		Port: "27017",
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
		TTL:    time.Hour, // default access token ttl (1 hour)
		Cookie: _defCookie,
	}
	_defAuth = Auth{
		AccessToken: _defAccessToken,
	}
	_defServer = Server{
		Port:            "80",
		ShutdownTimeout: time.Minute,
		Auth:            _defAuth,
	}
	_defApp = App{
		LocaleName: "UTC",
		Logging:    _defLogging,
		Server:     _defServer,
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
		User     string `yaml:"user"`
		Password string `env-required:"true" env:"DB_PASSWORD"`
		Name     string `yaml:"name"`
		Host     string `yaml:"host"`
		Port     string `yaml:"port"`
		DSN      string `yaml:"-"`
	}

	App struct {
		LocaleName string         `yaml:"locale"`
		Locale     *time.Location `yaml:"-" json:"-"`
		Logging    `yaml:"logging"`
		Server     `yaml:"server"`
	}

	Logging struct {
		LogLevel  int    `yaml:"log_level"`
		LogFormat string `yaml:"log_format"`
	}

	Server struct {
		Port            string        `yaml:"port"`
		ShutdownTimeout time.Duration `yaml:"shutdown_timeout"`
		SSL             SSL           `yaml:"ssl"`
		Auth            `yaml:"auth"`
	}

	SSL struct {
		Cert string `yaml:"cert"`
		Key  string `yaml:"key"`
	}

	Auth struct {
		AccessToken AccessToken `yaml:"access_token"`
	}

	AccessToken struct {
		Secret []byte        `env-required:"true" env:"DB_PASSWORD" json:"-"`
		TTL    time.Duration `yaml:"ttl"`
		Cookie Cookie        `yaml:"cookie"`
	}

	Cookie struct {
		Path     string `yaml:"path"`
		Secure   bool   `yaml:"secure"`
		HTTPOnly bool   `yaml:"http_only"`
		SameSite string `yaml:"same_site"`
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

	// parse locale name
	locale, err := time.LoadLocation(cfg.App.LocaleName)
	if err != nil {
		return nil, fmt.Errorf("parse locale name: %w", err)
	}
	cfg.App.Locale = locale

	// collect DSN string
	// collect DSN string
	cfg.DB.DSN = fmt.Sprintf(
		"user=%s password=%s host=%s port=%s dbname=%s",
		cfg.DB.User,
		cfg.DB.Password,
		cfg.DB.Host,
		cfg.DB.Port,
		cfg.DB.Name,
	)
	return cfg, nil
}
