package paymentoccurrence

import (
	"context"

	"backend/internal/app/entity"
)

// RepositoryDB is a payment occurrence repository interface.
type RepositoryDB interface {
	// Create creates a new payment occurrence.
	// Returns ErrAlreadyExists if occurrence already exists.
	Create(ctx context.Context, occ *entity.PaymentOccurrence) error

	// GetByID returns payment occurrence by given id.
	// Returns ErrNotFound if occurrence does not exist.
	GetByID(ctx context.Context, id int32) (*entity.PaymentOccurrence, error)

	// GetLatestByPayment returns the latest (by due_date) occurrence of given payment.
	// Returns ErrNotFound if there are no occurrences yet.
	GetLatestByPayment(ctx context.Context, paymentID int32) (*entity.PaymentOccurrence, error)

	// Update updates payment status fields of occurrence.
	// Returns ErrNotFound if occurrence does not exist.
	Update(ctx context.Context, data *entity.PaymentOccurrence) error

	// List returns payment occurrences matching filter.
	List(ctx context.Context, filter *entity.OccListFilter) ([]*entity.PaymentOccurrence, error)

	// Summary returns total amounts grouped by currency.
	Summary(ctx context.Context, todayDate string) ([]entity.OccSummary, error)
}
