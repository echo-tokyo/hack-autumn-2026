package repo

import (
	"context"
	"errors"
	"fmt"

	"gorm.io/gorm"

	"backend/internal/app/entity"
	recurringpayment "backend/internal/app/recurring_payment"
	"backend/internal/pkg/db"
	"backend/internal/pkg/db/transaction"
)

// Ensure DB implements interface.
var _ recurringpayment.RepositoryDB = (*DB)(nil)

// DB is a recurring payment DB repo.
// It implements the [RepositoryDB] interface.
type DB struct {
	dbStorage *db.DB
}

// NewDB returns a new instance of [DB].
func NewDB(dbStorage *db.DB) *DB {
	return &DB{
		dbStorage: dbStorage,
	}
}

// Create creates a new recurring payment.
func (r *DB) Create(ctx context.Context, payment *entity.RecurringPayment) error {
	tx := transaction.DB(ctx, r.dbStorage.DB)
	if err := tx.Create(payment).Error; err != nil {
		return fmt.Errorf("create: %w", err)
	}
	return nil
}

// GetByID returns recurring payment by given id.
// Returns ErrNotFound if payment does not exist.
func (r *DB) GetByID(ctx context.Context, id int32) (*entity.RecurringPayment, error) {
	tx := transaction.DB(ctx, r.dbStorage.DB)
	payment := &entity.RecurringPayment{}

	err := tx.Where("id = ? AND is_deleted = ?", id, false).
		First(payment).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, fmt.Errorf("get recurring payment by id: %w", recurringpayment.ErrNotFound)
	}
	return payment, err // err OR nil
}

// Delete marks recurring payment as deleted (soft delete).
// Returns ErrNotFound if payment does not exist.
func (r *DB) Delete(ctx context.Context, id int32) error {
	tx := transaction.DB(ctx, r.dbStorage.DB)

	result := tx.Model(&entity.RecurringPayment{}).
		Where("id = ? AND is_deleted = ?", id, false).
		Update("is_deleted", true)

	if result.Error != nil {
		return fmt.Errorf("soft delete by id %d: %w", id, result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("recurring payment with id %d: %w", id, recurringpayment.ErrNotFound)
	}

	return nil
}

// List returns all active recurring payments.
func (r *DB) List(ctx context.Context) ([]*entity.RecurringPayment, error) {
	tx := transaction.DB(ctx, r.dbStorage.DB)
	var payments []*entity.RecurringPayment

	err := tx.Where("is_deleted = ?", false).
		Order("id ASC").
		Find(&payments).Error

	if err != nil {
		return nil, fmt.Errorf("list: %w", err)
	}

	return payments, nil
}
