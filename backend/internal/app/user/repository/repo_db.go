// Package repository contains auth.RepositoryDB implementation.
package repository

import (
	"errors"
	"fmt"

	"gorm.io/gorm"

	"backend/config"
	"backend/internal/app/entity"
	"backend/internal/app/user"
	"backend/internal/pkg/db"
)

// Ensure RepoDB implements interface.
var _ user.RepositoryDB = (*RepoDB)(nil)

// RepoDB is a user DB repo.
// It implements the [user.RepositoryDB] interface.
type RepoDB struct {
	dbStorage *db.DB
	admin     *entity.User
}

// NewRepoDB returns a new instance of [RepoDB].
func NewRepoDB(cfg *config.Config, dbStorage *db.DB) *RepoDB {
	return &RepoDB{
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
func (r *RepoDB) Admin() *entity.User {
	return r.admin
}

// CreateUser creates a new user.
func (r *RepoDB) Create(userObj *entity.User) error {
	return r.dbStorage.Transaction(func(tx *gorm.DB) error {
		// create user
		err := r.dbStorage.Create(userObj).Error
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			// user with such username already exists
			return fmt.Errorf("user with username: %w: %s", user.ErrAlreadyExists, err.Error())
		}
		return err // err OR nil
	})
}

// GetByID returns user by given id.
func (r *RepoDB) GetByID(id int) (*entity.User, error) {
	var userObj entity.User
	err := r.dbStorage.Where(id).
		First(&userObj).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		// user object with such id not found
		return nil, fmt.Errorf("user with id: %w: %s", user.ErrNotFound, err.Error())
	}
	return &userObj, err // err OR nil
}

// GetByUsername returns user by given username.
func (r *RepoDB) GetByUsername(username string) (*entity.User, error) {
	var userObj entity.User
	err := r.dbStorage.Where("username = ?", username).
		First(&userObj).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		// user object with such id not found
		return nil, fmt.Errorf("user with id: %w: %s", user.ErrNotFound, err.Error())
	}
	return &userObj, err // err OR nil
}

// UpdateUser updates old user data to new one (by data ID).
func (r *RepoDB) Update(data *entity.User) error {
	// update user
	err := r.dbStorage.Model(&entity.User{}).
		Where("id = ?", data.ID).
		Save(data).Error
	return err // err OR nil
}

// Delete deletes user object and user profile (by data ID).
// Also user profile contacts (contact and parent contact) will be deleted
// if they are not used in other profiles.
func (r *RepoDB) Delete(data *entity.User) error {
	return r.dbStorage.Transaction(func(tx *gorm.DB) error {
		// delete user (cascade with profile)
		if err := tx.Delete(&entity.User{}, data.ID).Error; err != nil {
			return err
		}
		return nil
	})
}

// GetByRoles returns user (with class if set and profile) list with given roles.
// Free param appends condition (if only student role was given) to get class-free students.
// Search params appends condition to filter users by username and fullname (substring).
func (r *RepoDB) GetAll() ([]entity.User, error) {
	var userList []entity.User
	// create query
	query := r.dbStorage.
		Model(&entity.User{}).
		Order("id DESC")
	// execute query
	if err := query.Find(&userList).Error; err != nil {
		return nil, err
	}
	return userList, nil
}
