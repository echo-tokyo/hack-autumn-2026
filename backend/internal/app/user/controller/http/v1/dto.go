package v1

import (
	"errors"
	"fmt"

	"backend/internal/app/entity"
	"backend/internal/pkg/password"
	"backend/internal/pkg/serialize"
	"backend/internal/pkg/validator"
)

// @description userBody represents a data with user.
type userBody struct {
	// user username
	Username string `json:"username" validate:"required,max=50" example:"user1" maxLength:"50"`
	// user password
	Password string `json:"password" validate:"required,strong-passwd,min=8,max=40" example:"Qwerty123!" minLength:"8" maxLength:"40"`
}

func (u *userBody) Validate(valid validator.Validator) serialize.Validator {
	return func(s any) error {
		data, ok := s.(*userBody)
		if !ok {
			return errors.New("invalid data type")
		}

		if err := valid.Validate(data); err != nil {
			return err
		}
		if !password.Strong(data.Password) {
			return fmt.Errorf("%w: слабый пароль", validator.ErrValidate)
		}
		return nil
	}
}

func (u *userBody) ToEntity() *entity.User {
	return &entity.User{
		Username: u.Username,
		Password: []byte(u.Password),
	}
}

// @description userIDPath represents a data with user ID in path params.
type userIDPath struct {
	// user (and profile) id
	ID int `params:"id" validate:"required,numeric" example:"2"`
}

// @description updateBody represents a data to update user and profile.
type updateBody struct {
	// user username
	Username string `json:"username,omitempty" validate:"omitempty,max=50" example:"user1" maxLength:"50"`
	// user password
	Password string `json:"password,omitempty" validate:"omitempty,strong-passwd,min=8,max=40" example:"Qwerty123!" minLength:"8" maxLength:"40"`
}

func (u *updateBody) Validate(valid validator.Validator) serialize.Validator {
	return func(s any) error {
		data, ok := s.(*updateBody)
		if !ok {
			return errors.New("invalid data type")
		}

		if err := valid.Validate(data); err != nil {
			return err
		}
		if data.Password != "" && !password.Strong(data.Password) {
			return fmt.Errorf("%w: слабый пароль", validator.ErrValidate)
		}
		return nil
	}
}

func (u *updateBody) ToEntity() *entity.UserUpdate {
	// data reshaping
	return &entity.UserUpdate{
		Username: u.Username,
		Password: u.Password,
	}
}
