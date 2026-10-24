package entity

import (
	"time"

	"github.com/shopspring/decimal"
)

type PaymentOccurrence struct {
	ID                 int32           `gorm:"primaryKey;autoIncrement" json:"id"`
	RecurringPaymentID int32           `json:"recurring_payment_id"`
	Amount             decimal.Decimal `json:"amount"`
	Currency           Currency        `json:"currency"`
	DueDate            time.Time       `json:"due_date"`
	IsPaid             bool            `json:"is_paid"`
	PaymentDate        *time.Time      `json:"payment_date"`
	IsNotified         bool            `json:"is_notified"`
	NotifiedAt         *time.Time      `json:"notified_at"`
	CreatedAt          time.Time       `json:"created_at"`
	UpdatedAt          time.Time       `json:"updated_at"`
}
