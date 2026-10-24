package repository

import (
	"errors"
	"fmt"

	"gorm.io/gorm"

	"backend/internal/app/entity"
	payment "backend/internal/app/recurring_payment"
	"backend/internal/pkg/db"
)

// Ensure RepoDB implements interface.
var _ payment.RepositoryDB = (*RepoDB)(nil)

// RepoDB is a recurring payment DB repo.
// It implements the [RepositoryDB] interface.
type RepoDB struct {
	dbStorage *db.DB
}

// NewRepoDB returns a new instance of [RepoDB].
func NewRepoDB(dbStorage *db.DB) *RepoDB {
	return &RepoDB{
		dbStorage: dbStorage,
	}
}

// Create creates a new recurring payment.
func (r *RepoDB) Create(rp *entity.RecurringPayment) error {
	if err := r.dbStorage.Create(rp).Error; err != nil {
		return fmt.Errorf("create: %w", err)
	}
	return nil
}

// GetByID returns recurring payment by given id.
func (r *RepoDB) GetByID(id int32) (*entity.RecurringPayment, error) {
	var rp entity.RecurringPayment

	err := r.dbStorage.
		Where("id = ? AND is_deleted = ?", id, false).
		First(&rp).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, fmt.Errorf("recurring payment with id %d: %w", id, payment.ErrNotFound)
	}
	if err != nil {
		return nil, fmt.Errorf("query by id %d: %w", id, err)
	}

	return &rp, nil
}

// List returns all active (not soft-deleted) recurring payments.
func (r *RepoDB) List() ([]*entity.RecurringPayment, error) {
	var payments []*entity.RecurringPayment

	err := r.dbStorage.
		Where("is_deleted = ?", false).
		Order("id ASC").
		Find(&payments).Error

	if err != nil {
		return nil, fmt.Errorf("list: %w", err)
	}

	return payments, nil
}

// SoftDelete marks recurring payment as deleted.
func (r *RepoDB) SoftDelete(id int32) error {
	result := r.dbStorage.
		Model(&entity.RecurringPayment{}).
		Where("id = ? AND is_deleted = ?", id, false).
		Update("is_deleted", true)

	if result.Error != nil {
		return fmt.Errorf("soft delete by id %d: %w", id, result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("recurring payment with id %d: %w", id, payment.ErrNotFound)
	}

	return nil
}
