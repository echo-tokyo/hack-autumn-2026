package recurringpayment

import "backend/internal/app/entity"

// UsecaseAdmin is a recurring payment usecase for admin role.
// Admin is allowed to list, create and delete recurring payments.
type UsecaseAdmin interface {
	// List returns all active recurring payments.
	List() ([]*entity.RecurringPayment, error)

	// Create creates a new recurring payment.
	// Returns ErrInvalidArgument on invalid input.
	Create(rp *entity.RecurringPayment) error

	// Delete soft-deletes recurring payment and stops its reminders.
	// History is preserved. Returns ErrNotFound if payment does not exist.
	Delete(id int32) error
}

// UsecaseClient is a recurring payment usecase for regular user role.
// Regular user is only allowed to list recurring payments.
type UsecaseClient interface {
	// List returns all active recurring payments.
	List() ([]*entity.RecurringPayment, error)
}
