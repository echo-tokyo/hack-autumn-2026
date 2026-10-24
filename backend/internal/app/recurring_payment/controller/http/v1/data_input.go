package v1

import (
	"github.com/shopspring/decimal"
)

// @description recurringPaymentBody represents input for creating a recurring payment.
type recurringPaymentBody struct {
	// payment name
	Name string `json:"name" validate:"required,max=255" example:"Аренда офиса" maxLength:"255"`
	// payment amount; JSON may be string or number, decimal parses both
	Amount decimal.Decimal `json:"amount" validate:"required" example:"50000"`
	// payment currency
	Currency string `json:"currency" validate:"required,oneof=RUB USD EUR" example:"RUB" enums:"RUB,USD,EUR"`
	// day of month when payment is due (1-31)
	BillingDay int32 `json:"billingDay" validate:"required,min=1,max=31" example:"31" minimum:"1" maximum:"31"`
	// date of the first payment, YYYY-MM-DD
	StartDate string `json:"startDate" validate:"required,datetime=2006-01-02" example:"2026-10-31"`
}

// @description idPath represents a data with ID in path params.
type idPath struct {
	// user (and profile) id
	ID int32 `params:"id" validate:"required,numeric" example:"2"`
}
