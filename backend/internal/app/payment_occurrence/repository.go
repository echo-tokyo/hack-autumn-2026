package paymentoccurrence

import (
	"time"

	"backend/internal/app/entity"
)

type Status string

const (
	StatusPaid    Status = "paid"
	StatusUnpaid  Status = "unpaid"
	StatusOverdue Status = "overdue"
)

// Valid reports whether status is one of supported values.
func (s Status) Valid() bool {
	switch s {
	case StatusPaid, StatusUnpaid, StatusOverdue:
		return true
	}
	return false
}

// RepositoryDB is a payment occurrence repository interface.
type RepositoryDB interface {
	// Create creates a new payment occurrence.
	// Returns ErrAlreadyExists if occurrence with same
	// (recurring_payment_id, due_date) already exists.
	Create(occ *entity.PaymentOccurrence) error

	// GetByID returns payment occurrence by given id.
	// Returns ErrNotFound if occurrence does not exist.
	GetByID(id int32) (*entity.PaymentOccurrence, error)

	// List returns payment occurrences matching filter,
	// ordered by due_date ascending.
	List(filter ListFilter) ([]*entity.PaymentOccurrence, error)

	// GetLatestByRecurringPayment returns the latest (by due_date)
	// occurrence of given recurring payment.
	// Returns ErrNotFound if there are no occurrences yet.
	GetLatestByRecurringPayment(recurringPaymentID int32) (*entity.PaymentOccurrence, error)

	// Update updates payment status fields of occurrence.
	// Only IsPaid, PaymentDate, IsNotified and NotifiedAt are updated.
	// Returns ErrNotFound if occurrence does not exist.
	Update(occ *entity.PaymentOccurrence) error

	// ListToRemind returns occurrences that need a reminder:
	// Ordered by due_date ascending.
	ListToRemind(deadline time.Time) ([]*entity.PaymentOccurrence, error)

	// MarkNotified sets is_notified=true and notified_at=at
	// for occurrence with given id.
	// Returns ErrNotFound if occurrence does not exist.
	MarkNotified(id int32, at time.Time) error

	// Summary returns total amounts grouped by currency.
	Summary(today time.Time) (map[entity.Currency]CurrencySummary, error)
}

// ListFilter represents optional filters for List.
type ListFilter struct {
	// RecurringPaymentID filters occurrences by parent recurring payment.
	RecurringPaymentID *int32
	// Currency filters occurrences by currency (RUB/USD/EUR).
	Currency *entity.Currency
	// Status filters occurrences by computed status (paid/unpaid/overdue).
	Status *Status
	// today is set by usecase (in configured timezone) before calling List.
	// It is required when Status is unpaid or overdue.
	Today time.Time
}
