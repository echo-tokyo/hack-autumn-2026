package paymentoccurrence

import "errors"

var (
	ErrNotFound        = errors.New("record not found")
	ErrAlreadyExists   = errors.New("record already exists")
	ErrInvalidArgument = errors.New("invalid argument")
)
