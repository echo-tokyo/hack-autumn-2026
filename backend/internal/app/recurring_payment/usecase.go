package recurringpayment

import "backend/internal/app/entity"

// UsecaseAdmin is a recurring payment usecase for admin role.
type UsecaseAdmin interface {
	// Create creates a new recurring payment, actual occurrence and backfill occurrences.
	Create(payment *entity.RecurringPayment) error

	// Delete soft-deletes recurring payment.
	Delete(id int32) error

	// List returns all active recurring payments.
	List() ([]*entity.RecurringPayment, error)
}

// UsecaseClient is a recurring payment usecase for regular user role.
type UsecaseClient interface {
	// List returns all active recurring payments.
	List() ([]*entity.RecurringPayment, error)
}
