// Package repo contains auth.RepositoryDB implementation.
package repo

import (
	"context"
	"errors"
	"fmt"

	"gorm.io/gorm"

	"backend/config"
	"backend/internal/app/entity"
	"backend/internal/app/user"
	"backend/internal/pkg/db"
	"backend/internal/pkg/db/transaction"
)

// Ensure DB implements interface.
var _ user.RepositoryDB = (*DB)(nil)

// DB is a user DB repo.
// It implements the [user.RepositoryDB] interface.
type DB struct {
	dbStorage *db.DB
	admin     *entity.User
}

// NewDB returns a new instance of [DB].
func NewDB(cfg *config.Config, dbStorage *db.DB) *DB {
	return &DB{
		dbStorage: dbStorage,
		admin: &entity.User{
			ID:       0,
			Username: cfg.Admin.Username,
			Password: cfg.Admin.Password,
			IsAdmin:  true,
		},
	}
}

// Admin returns admin user.
func (r *DB) Admin() *entity.User {
	return r.admin
}

// CreateUser creates a new user.
func (r *DB) Create(ctx context.Context, userObj *entity.User) error {
	tx := transaction.DB(ctx, r.dbStorage.DB)

	err := tx.Create(userObj).Error
	if errors.Is(err, gorm.ErrDuplicatedKey) {
		// user with such username already exists
		return fmt.Errorf("user with username: %w: %s", user.ErrAlreadyExists, err.Error())
	}
	return err // err OR nil
}

// GetByID returns user by given id.
func (r *DB) GetByID(ctx context.Context, id int) (*entity.User, error) {
	return r.getBy(ctx, "id", id)
}

// GetByUsername returns user by given username.
func (r *DB) GetByUsername(ctx context.Context, username string) (*entity.User, error) {
	return r.getBy(ctx, "username", username)
}

// UpdateUser saves new user data (by data ID).
func (r *DB) Update(ctx context.Context, data *entity.User) error {
	tx := transaction.DB(ctx, r.dbStorage.DB)

	err := tx.Model(&entity.User{}).
		Where("id = ?", data.ID).
		Save(data).Error
	return err // err OR nil
}

// Delete deletes user object (by data ID).
func (r *DB) Delete(ctx context.Context, data *entity.User) error {
	tx := transaction.DB(ctx, r.dbStorage.DB)
	if err := tx.Delete(&entity.User{}, data.ID).Error; err != nil {
		return err
	}
	return nil
}

// GetAll returns all users.
func (r *DB) GetAll(ctx context.Context) ([]entity.User, error) {
	tx := transaction.DB(ctx, r.dbStorage.DB)
	var userList []entity.User

	// create query
	query := tx.Model(&entity.User{}).
		Order("id DESC")
	// execute query
	if err := query.Find(&userList).Error; err != nil {
		return nil, err
	}
	return userList, nil
}

// getBy returns user by given field filter.
func (r *DB) getBy(ctx context.Context, field string, value any) (*entity.User, error) {
	tx := transaction.DB(ctx, r.dbStorage.DB)

	var userObj entity.User
	err := tx.Where(field+" = ?", value).
		First(&userObj).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		// user object not found
		return nil, fmt.Errorf("get user by %s: %w: %s", field, user.ErrNotFound, err.Error())
	}
	return &userObj, err // err OR nil
}
