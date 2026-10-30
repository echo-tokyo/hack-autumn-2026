package user

import "errors"

var (
	ErrWeekPassword  = errors.New("week password")         // code 400
	ErrNotFound      = errors.New("record not found")      // code 404
	ErrAlreadyExists = errors.New("record already exists") // code 409
)
