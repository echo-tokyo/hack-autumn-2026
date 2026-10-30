package repo

import (
	"errors"
	"fmt"
	"time"

	"backend/config"
	"backend/internal/app/auth"
	"backend/internal/pkg/cache"
)

const _blacklistPrefix = "token:blacklisted:" // key prefix for blacklisted token values

var _blacklisted = []byte("1") // value for blacklisted tokens

// Ensure Cache implements interface.
var _ auth.RepositoryCache = (*Cache)(nil)

// Cache is an auth cache repo.
// It implements the [auth.Cache] interface.
type Cache struct {
	cfg          *config.Config
	cacheStorage cache.Storage
}

// NewCache returns a new instance of [Cache].
func NewCache(cfg *config.Config, cacheStorage cache.Storage) *Cache {
	return &Cache{
		cfg:          cfg,
		cacheStorage: cacheStorage,
	}
}

// Set token to blacklist expiring after exp duration.
func (r *Cache) SetTokenToBlacklist(token string, exp time.Duration) error {
	err := r.cacheStorage.Set(_blacklistPrefix+token, _blacklisted, exp)
	if err != nil {
		return fmt.Errorf("set to cache: %w", err)
	}
	return nil
}

// TokenIsBlacklisted returns true, if given token is blacklisted.
func (r *Cache) TokenIsBlacklisted(token string) (bool, error) {
	val, err := r.cacheStorage.Get(_blacklistPrefix + token)
	if err != nil && !errors.Is(err, cache.ErrNotFound) {
		return false, fmt.Errorf("get from cache: %w", err)
	}
	return len(val) > 0, nil
}
