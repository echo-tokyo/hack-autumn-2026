package v1

import (
	"backend/internal/app/entity"
)

// @description userBody represents a data with user.
type userBody struct {
	// user username
	Username string `json:"username" validate:"required,max=50" example:"user1" maxLength:"50"`
	// user password
	Password string `json:"password" validate:"required,strong-passwd,min=8,max=40" example:"Qwerty123!" minLength:"8" maxLength:"40"`
}

func (u *userBody) ToEntityUser() *entity.User {
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

func (u *updateBody) ToEntityUser() *entity.UserUpdate {
	// data reshaping
	return &entity.UserUpdate{
		Username: u.Username,
		Password: u.Password,
	}
}
