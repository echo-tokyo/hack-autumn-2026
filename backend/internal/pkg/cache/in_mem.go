package cache

import (
	"sync"
	"time"
)

// InMem is an in-memory (golang goroutines) key-value storage.
// It implements KeyValue interface.
type InMem struct {
	mu      sync.RWMutex
	storage map[string]InMemItem
}

// InMemItem represents an InMem item.
type InMemItem struct {
	Value []byte
	Timer *time.Timer
}

// NewInMem returns a new instance of InMem.
func NewInMem() *InMem {
	return &InMem{
		storage: make(map[string]InMemItem),
	}
}

// Get returns value by the given key.
// Returns error if key-value was not found.
func (s *InMem) Get(key string) ([]byte, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	value, ok := s.storage[key]
	// if key not found
	if !ok {
		return nil, ErrNotFound
	}
	return value.Value, nil
}

// Set sets new key-value pair (expired after exp).
// Expiration value 0 means no expiration.
func (s *InMem) Set(key string, val []byte, exp time.Duration) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	// stop timer if key-value already exists
	if oldItem, ok := s.storage[key]; ok && oldItem.Timer != nil {
		oldItem.Timer.Stop()
	}

	var timer *time.Timer
	if exp != 0 {
		// create task to delete key-value from the storage after exp duration
		timer = time.AfterFunc(exp, func() { s.Delete(key) }) //nolint:errcheck // cannot occurs
	}

	s.storage[key] = InMemItem{Value: val, Timer: timer}
	return nil
}

// Delete deletes value by the given key.
// It handles non-existent keys gracefully (without error).
func (s *InMem) Delete(key string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if item, ok := s.storage[key]; ok {
		if item.Timer != nil {
			item.Timer.Stop()
		}
		delete(s.storage, key)
	}
	return nil
}

// Reset deletes all key-values from the storage.
func (s *InMem) Reset() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	for key, item := range s.storage {
		if item.Timer != nil {
			item.Timer.Stop()
		}
		delete(s.storage, key)
	}
	return nil
}

// Close closes the storage.
func (s *InMem) Close() error {
	return s.Reset()
}
