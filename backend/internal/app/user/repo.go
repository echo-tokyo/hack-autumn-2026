package user

import "backend/internal/app/entity"

// RepositoryDB describes all DB methods for user.
type RepositoryDB interface {
	// Admin returns admin user.
	Admin() *entity.User

	// Create creates a new user.
	Create(userObj *entity.User) error
	// GetByID returns user by given ID.
	GetByID(id int) (*entity.User, error)
	// GetByUsername returns user by given username.
	GetByUsername(username string) (*entity.User, error)
	// Update updates old user data to new one (by data ID).
	Update(data *entity.User) error
	// Delete deletes user object (by data ID).
	Delete(data *entity.User) error
	// GetAll returns all users.
	GetAll() ([]entity.User, error)
}
