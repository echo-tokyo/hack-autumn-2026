package entity

import (
	"time"

	"github.com/shopspring/decimal"
)

type RecurringPayment struct {
	ID         int32           `gorm:"primaryKey;autoIncrement" json:"id"`
	Name       string          `json:"name"`
	Amount     decimal.Decimal `json:"amount"`
	Currency   Currency        `json:"currency"`
	BillingDay int32           `json:"billing_day"`
	StartDate  time.Time       `json:"start_date"`
	IsDeleted  bool            `json:"is_deleted"`
	CreatedAt  time.Time       `json:"created_at"`
	UpdatedAt  time.Time       `json:"updated_at"`
}
