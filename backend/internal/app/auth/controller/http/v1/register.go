// Package http/v1 is a first version of auth HTTP-controller.
// It provides registers for auth HTTP-routes and controller with handlers for them.
package v1

import (
	fiber "github.com/gofiber/fiber/v2"
)

// RegisterEndpoints registers all auth endpoints.
func RegisterEndpoints(router fiber.Router, controller *AuthController,
	mwJWTRefresh fiber.Handler) {

	group := router.Group("/auth")
	// public
	group.Post("/login", controller.LogIn)
	// authenticated only
	group.Post("/obtain", mwJWTRefresh, controller.Obtain)
	group.Post("/logout", mwJWTRefresh, controller.LogOut)
}
