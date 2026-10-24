// Package entity contains all app entities used in the app's core logic.
package entity

import "time"

// User represents an app user with main user data.
type User struct {
	// user id
	ID int `gorm:"primaryKey;autoIncrement" json:"id" validate:"required"`
	// user username
	Username string `json:"username" validate:"required"`
	// user password hash
	Password []byte `json:"-"`
	// true if user is admin
	IsAdmin bool `gorm:"-" json:"isAdmin" validate:"required"`
	// user creating datetime
	CreatedAt time.Time `json:"-"`
	// user updating datetime
	UpdatedAt time.Time `json:"-"`
}

// TableName determines DB table name for the user object.
func (*User) TableName() string {
	return "users"
}

// UserClaims represents a claims with user data for JWT-tokens.
type UserClaims struct {
	// user ID
	ID int `json:"id"`
	// true if user is admin
	IsAdmin bool `json:"is_admin"`
}

// Token represents a user token pair (access and refresh).
type Token struct {
	// access token
	Access string
	// refresh token
	Refresh string
}

// UserWithToken is a user object and a token object.
type UserWithToken struct {
	User  *User
	Token *Token `json:"-"`
}

type UserUpdate struct {
	Username string
	Password string
}
