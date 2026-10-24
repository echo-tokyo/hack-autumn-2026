package custom

import (
	"github.com/go-playground/validator/v10"

	"backend/internal/pkg/password"
)

var StrongPasswd = &ValidTag{
	Tag: "strong-passwd",
	validFunc: func(fl validator.FieldLevel) bool {
		return password.Strong(fl.Field().String())
	},
	translations: map[string]string{
		"en": "password too weak",
		"ru": "слабый пароль",
	},
}
