package paymentoccurrence

import (
	"time"

	"github.com/shopspring/decimal"

	"backend/internal/app/entity"
)

// UpdateInput represents changes to apply to a payment occurrence.
//
// Rules:
//   - IsPaid=false            → unmark, PaymentDate cleared.
//   - IsPaid=true, date=nil   → mark paid today.
//   - IsPaid=true, date=given → mark paid on given date.
//   - IsPaid=nil, date=given  → fix date of already paid occurrence.
type UpdateInput struct {
	IsPaid      *bool
	PaymentDate *time.Time
}

// Usecase is a payment occurrence usecase.
// Both admin and regular user have the same permissions here:
// list, view, and mark paid / unpaid / fix date.
type Usecase interface {
	// List returns occurrences matching filter.
	// IsOverdue is computed for each.
	List(filter ListFilter) ([]*entity.PaymentOccurrence, error)

	// GetByID returns occurrence by given id.
	// IsOverdue is computed.
	GetByID(id int32) (*entity.PaymentOccurrence, error)

	// Update applies payment status changes.
	// Returns updated occurrence with IsOverdue computed.
	Update(id int32, input UpdateInput) (*entity.PaymentOccurrence, error)

	// Summary returns total amounts grouped by currency.
	Summary() (map[entity.Currency]decimal.Decimal, error)
}
