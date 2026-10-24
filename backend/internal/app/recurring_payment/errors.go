package recurringpayment

import "errors"

var (
	ErrNotFound        = errors.New("record not found")
	ErrInvalidArgument = errors.New("invalid argument")
)
