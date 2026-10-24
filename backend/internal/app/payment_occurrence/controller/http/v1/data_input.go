package v1

// @description updateOccurrenceBody represents changes to apply to a payment occurrence.
type updateOccurrenceBody struct {
	// new payment status
	IsPaid *bool `json:"is_paid" example:"true"`
	// actual payment date (YYYY-MM-DD)
	PaymentDate *string `json:"payment_date" validate:"omitempty,datetime=2006-01-02" example:"2026-10-20"`
}
