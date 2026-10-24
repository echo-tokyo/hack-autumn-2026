package v1

import (
	fiber "github.com/gofiber/fiber/v2"
)

// RegisterEndpoints registers all recurring payment endpoints.
func RegisterEndpoints(router fiber.Router,
	controller *RecurringPaymentController, controllerAdmin *RecurringPaymentControllerAdmin,
	mwJWTAccess fiber.Handler, adminOnly fiber.Handler) {

	rpGroup := router.Group("/recurring-payments", mwJWTAccess)

	// both admin and regular user may list
	rpGroup.Get("/", controller.List)

	// admin-only operations
	rpGroup.Post("/", adminOnly, controllerAdmin.Create)
	rpGroup.Delete("/:id", adminOnly, controllerAdmin.Delete)
}
