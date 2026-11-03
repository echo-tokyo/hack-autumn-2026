package entity

import (
	"time"

	"github.com/shopspring/decimal"
)

const _dateFmt = "02-01-2006"

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

type PaymentOccurrence struct {
	ID                   int32  `gorm:"primaryKey;autoIncrement" json:"id"`
	RecurringPaymentID   int32  `json:"recurringPaymentId"`
	RecurringPaymentName string `gorm:"->;column:recurring_payment_name" json:"name"`

	Amount      decimal.Decimal `json:"amount"`
	Currency    Currency        `json:"currency"`
	DueDate     time.Time       `json:"dueDate"`
	IsPaid      bool            `json:"isPaid"`
	PaymentDate *time.Time      `json:"paymentDate"`
	CreatedAt   time.Time       `json:"createdAt"`
	UpdatedAt   time.Time       `json:"updatedAt"`

	IsOverdue   bool  `gorm:"-" json:"isOverdue"`
	OverdueDays int32 `gorm:"-" json:"overdueDays"`
}

func (o *PaymentOccurrence) DueDateFmt() string {
	return o.DueDate.Format(_dateFmt)
}

type OccUpdate struct {
	IsPaid      *bool
	PaymentDate *time.Time
}

type OccSummary struct {
	Currency Currency        `json:"currency"`
	ToPay    decimal.Decimal `json:"toPay"`
	Overdue  decimal.Decimal `json:"overdue"`
	Paid     decimal.Decimal `json:"paid"`
}

type OccListFilter struct {
	// ID of parent recurring payment
	RecurringPaymentID *int32
	// payment currency
	Currency *Currency
	// occurrence status (paid/unpaid/overdue)
	Status *Status
	// formatted time.Time as "2006-01-02"
	Today string
}
