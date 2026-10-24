package recurringpayment

import "backend/internal/app/entity"

// RepositoryDB is a recurring payment repository interface.
type RepositoryDB interface {
	// Create creates a new recurring payment.
	Create(rp *entity.RecurringPayment) error

	// GetByID returns recurring payment by given id.
	// Returns ErrNotFound if payment does not exist or was soft-deleted.
	GetByID(id int32) (*entity.RecurringPayment, error)

	// List returns all active (not soft-deleted) recurring payments
	// ordered by id ascending.
	List() ([]*entity.RecurringPayment, error)

	// SoftDelete marks recurring payment as deleted.
	// Returns ErrNotFound if payment does not exist or was already deleted.
	SoftDelete(id int32) error
}
