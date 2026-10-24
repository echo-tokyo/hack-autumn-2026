// Package http/v1 is a first version of user HTTP-controller.
// It provides registers for user HTTP-routes and controller with handlers for them.
package v1

import (
	fiber "github.com/gofiber/fiber/v2"
)

// RegisterEndpoints registers all user endpoints.
func RegisterEndpoints(router fiber.Router,
	controller *UserController, controllerAdmin *UserControllerAdmin,
	mwJWTAccess fiber.Handler, adminOnly fiber.Handler) {

	router.Get("/auth/me", mwJWTAccess, controller.GetMe)

	authGroup := router.Group("/users", mwJWTAccess)
	authGroup.Post("/", adminOnly, controllerAdmin.Create)
	authGroup.Get("/", adminOnly, controllerAdmin.List)
	authGroup.Get("/:id", adminOnly, controllerAdmin.Read)
	authGroup.Patch("/:id", adminOnly, controllerAdmin.Update)
	authGroup.Delete("/:id", adminOnly, controllerAdmin.Delete)
}
