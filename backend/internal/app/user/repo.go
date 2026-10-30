package user

import (
	"backend/internal/app/entity"
	"context"
)

// RepositoryDB describes all DB methods for user.
type RepositoryDB interface {
	// Admin returns admin user.
	Admin() *entity.User

	// Create creates a new user.
	Create(ctx context.Context, userObj *entity.User) error

	// GetByID returns user by given ID.
	GetByID(ctx context.Context, id int) (*entity.User, error)

	// GetByUsername returns user by given username.
	GetByUsername(ctx context.Context, username string) (*entity.User, error)

	// UpdateUser saves new user data (by data ID).
	Update(ctx context.Context, data *entity.User) error

	// Delete deletes user object (by data ID).
	Delete(ctx context.Context, data *entity.User) error

	// GetAll returns all users.
	GetAll(ctx context.Context) ([]entity.User, error)
}
