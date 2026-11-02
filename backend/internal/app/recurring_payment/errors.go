package recurringpayment

import "errors"

var (
	ErrDateTooFar = errors.New("date too far in the past") // code 400
	ErrNotFound   = errors.New("record not found")         // code 404
)
