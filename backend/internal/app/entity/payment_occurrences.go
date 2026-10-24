package entity

import (
	"time"

	"github.com/shopspring/decimal"
)

type PaymentOccurrence struct {
	ID                   int32  `gorm:"primaryKey;autoIncrement" json:"id"`
	RecurringPaymentID   int32  `json:"recurringPaymentId"`
	RecurringPaymentName string `gorm:"->;column:recurring_payment_name" json:"name"`

	Amount      decimal.Decimal `json:"amount"`
	Currency    Currency        `json:"currency"`
	DueDate     time.Time       `json:"dueDate"`
	IsPaid      bool            `json:"isPaid"`
	PaymentDate *time.Time      `json:"paymentDate"`
	IsNotified  bool            `json:"isNotified"`
	NotifiedAt  *time.Time      `json:"notifiedAt"`
	CreatedAt   time.Time       `json:"createdAt"`
	UpdatedAt   time.Time       `json:"updatedAt"`

	IsOverdue   bool  `gorm:"-" json:"isOverdue"`
	OverdueDays int32 `gorm:"-" json:"overdueDays"`
}
