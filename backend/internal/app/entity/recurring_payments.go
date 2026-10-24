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
	BillingDay int32           `json:"billingDay"`
	StartDate  time.Time       `json:"startDate"`
	IsDeleted  bool            `json:"isDeleted"`
	CreatedAt  time.Time       `json:"createdAt"`
	UpdatedAt  time.Time       `json:"updatedAt"`
}
