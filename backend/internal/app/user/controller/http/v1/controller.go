package v1

import (
	"fmt"

	fiber "github.com/gofiber/fiber/v2"

	"backend/internal/app/user"
	utilsjwt "backend/internal/pkg/utils/jwt"
	"backend/internal/pkg/validator"
)

// UserController represents a controller for user routes accepted for all clients.
type UserController struct {
	valid        validator.Validator
	userUCClient user.UsecaseClient
}

// NewController returns a new instance of [UserController].
func NewController(userUCClient user.UsecaseClient,
	valid validator.Validator) *UserController {

	return &UserController{
		valid:        valid,
		userUCClient: userUCClient,
	}
}

// @summary		Получение информации о себе.
// @description	Получение всей информации о себе (юзер, профиль).
// @router			/auth/me [get]
// @id				auth-me-get
// @tags			auth
// @accept			json
// @produce		json
// @security		JWTAccess
// @success		200	{object}	entity.User
// @failure		401	"неверный токен (пустой, истекший или неверный формат)"
func (c *UserController) GetMe(ctx *fiber.Ctx) error {
	// parse user claims
	userClaims := utilsjwt.ParseUserClaimsFromRequest(ctx)

	if userClaims.IsAdmin {
		return ctx.Status(fiber.StatusOK).JSON(c.userUCClient.Admin())
	}

	userResp, err := c.userUCClient.GetByID(userClaims.ID)
	if err != nil {
		return fmt.Errorf("read: %w", err)
	}
	return ctx.Status(fiber.StatusOK).JSON(userResp)
}
