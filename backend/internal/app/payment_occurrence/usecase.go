package paymentoccurrence

import (
	"backend/internal/app/entity"
)

// Usecase is a payment occurrence usecase.
type Usecase interface {
	// GetByID returns occurrence by given id.
	GetByID(id int32) (*entity.PaymentOccurrence, error)

	// Update applies payment status changes. Returns updated occurrence.
	Update(id int32, input *entity.OccUpdate) (*entity.PaymentOccurrence, error)

	// List returns occurrences matching filter.
	List(filter *entity.OccListFilter) ([]*entity.PaymentOccurrence, error)

	// Summary returns total amounts grouped by currency.
	Summary() ([]entity.OccSummary, error)
}
