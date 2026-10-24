package user

import "errors"

var (
	ErrNotFound      = errors.New("record not found")      // code 404
	ErrAlreadyExists = errors.New("record already exists") // code 409
)
