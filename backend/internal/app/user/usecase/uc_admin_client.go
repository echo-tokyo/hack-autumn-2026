// Package usecase contains user.UsecaseAdmin, user.UsecaseClient
// and user.UsecaseManager implementations.
package usecase

import (
	"fmt"
	"log/slog"

	"backend/config"
	"backend/internal/app/entity"
	"backend/internal/app/user"
	"backend/internal/pkg/password"
)

// Ensure UCAdmin implements interfaces.
var _ user.UsecaseAdmin = (*UCAdminClient)(nil)
var _ user.UsecaseClient = (*UCAdminClient)(nil)

// UCAdminClient represents a user usecase for admin and client.
// It implements the [user.UsecaseAdmin] and the [user.UsecaseClient] interfaces.
type UCAdminClient struct {
	cfg        *config.Config
	userRepoDB user.RepositoryDB
}

// NewUCAdminClient returns a new instance of [UCAdminClient].
func NewUCAdminClient(cfg *config.Config, userRepoDB user.RepositoryDB) *UCAdminClient {
	return &UCAdminClient{
		cfg:        cfg,
		userRepoDB: userRepoDB,
	}
}

// Admin returns admin user.
func (u *UCAdminClient) Admin() *entity.User {
	return u.userRepoDB.Admin()
}

// GetByID returns user object with profile by given id.
func (u *UCAdminClient) Create(userObj *entity.User) error {
	if err := u.userRepoDB.Create(userObj); err != nil {
		return fmt.Errorf("create: %w", err)
	}
	return nil
}

// GetByID returns user object with profile by given id.
func (u *UCAdminClient) GetByID(id int) (*entity.User, error) {
	userObj, err := u.userRepoDB.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("get by id: %w", err)
	}
	return userObj, nil
}

// Update updates user by given ID with given data.
// It returns user object with updated user data.
func (u *UCAdminClient) Update(id int, data *entity.UserUpdate) (*entity.User, error) {
	userObj, err := u.userRepoDB.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("get by id: %w", err)
	}

	if data.Username != "" {
		userObj.Username = data.Username
	}
	if data.Password != "" {
		userObj.Password, err = password.Encode([]byte(data.Password))
		if err != nil {
			return nil, fmt.Errorf("encode new password: %w", err)
		}
	}
	slog.Debug("update", "raw", string(data.Password), "hash", userObj.Password)
	if err := u.userRepoDB.Update(userObj); err != nil {
		return nil, fmt.Errorf("user: %w", err)
	}
	return userObj, nil
}

// DeleteByID deletes user object and user profile with given id.
func (u *UCAdminClient) DeleteByID(id int) error {
	userObj, err := u.userRepoDB.GetByID(id)
	if err != nil {
		return fmt.Errorf("get by id: %w", err)
	}
	if err := u.userRepoDB.Delete(userObj); err != nil {
		return fmt.Errorf("delete by id: %w", err)
	}
	return nil
}

// GetAll returns all users.
func (u *UCAdminClient) GetAll() ([]entity.User, error) {
	userList, err := u.userRepoDB.GetAll()
	if err != nil {
		return nil, fmt.Errorf("get all: %w", err)
	}
	return userList, nil
}
