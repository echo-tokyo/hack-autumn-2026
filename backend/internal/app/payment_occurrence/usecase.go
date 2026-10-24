package paymentoccurrence

import (
	"time"

	"github.com/shopspring/decimal"

	"backend/internal/app/entity"
)

// UpdateInput represents changes to apply to a payment occurrence.
type UpdateInput struct {
	IsPaid      *bool
	PaymentDate *time.Time
}

type CurrencySummary struct {
	Currency entity.Currency `json:"currency"`
	ToPay    decimal.Decimal `json:"toPay"`
	Overdue  decimal.Decimal `json:"overdue"`
	Paid     decimal.Decimal `json:"paid"`
}

// Usecase is a payment occurrence usecase.
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
	Summary() ([]CurrencySummary, error)
}
