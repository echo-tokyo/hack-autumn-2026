// Package user contains all repos, usecases and controllers for user.
// Sub-package repo contains RepoDB implementation.
// Sub-package usecase contains UsecaseManager, UsecaseAdmin and UsecaseClient implementations.
package user

import "backend/internal/app/entity"

// UsecaseAdmin describes all user usecases for admin panel.
type UsecaseAdmin interface {
	// Create creates a new user with profile in the DB and returns them.
	// User.Password is a raw (not hashed) password.
	Create(userObj *entity.User) error
	// GetByID returns user object with profile by given id.
	GetByID(id int) (*entity.User, error)
	// Update updates user by given ID with given data.
	// It returns user object with updated user data.
	Update(id int, data *entity.UserUpdate) (*entity.User, error)
	// DeleteByID deletes user object and user profile with given id.
	DeleteByID(id int) error
	// GetAll returns all users.
	GetAll() ([]entity.User, error)
}

// UsecaseClient describes all user usecases for client.
type UsecaseClient interface {
	// Admin returns admin user.
	Admin() *entity.User

	// GetByID returns user object with profile by given id.
	GetByID(id int) (*entity.User, error)
}
