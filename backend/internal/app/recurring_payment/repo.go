package recurringpayment

import (
	"backend/internal/app/entity"
	"context"
)

// RepositoryDB is a recurring payment repository interface.
type RepositoryDB interface {
	// Create creates a new recurring payment.
	Create(ctx context.Context, payment *entity.RecurringPayment) error

	// GetByID returns recurring payment by given id.
	// Returns ErrNotFound if payment does not exist.
	GetByID(ctx context.Context, id int32) (*entity.RecurringPayment, error)

	// Delete marks recurring payment as deleted (soft delete).
	// Returns ErrNotFound if payment does not exist.
	Delete(ctx context.Context, id int32) error

	// List returns all active recurring payments.
	List(ctx context.Context) ([]*entity.RecurringPayment, error)
}
