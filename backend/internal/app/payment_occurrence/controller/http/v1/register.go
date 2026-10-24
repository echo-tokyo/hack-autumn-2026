package v1

import (
	fiber "github.com/gofiber/fiber/v2"
)

// RegisterEndpoints registers all payment occurrence endpoints.
func RegisterEndpoints(router fiber.Router,
	controller *PaymentOccurrenceController, mwJWTAccess fiber.Handler) {

	occurrences := router.Group("/payment-occurrences", mwJWTAccess)
	occurrences.Get("/", controller.List)
	occurrences.Get("/:id", controller.GetByID)
	occurrences.Patch("/:id", controller.Update)

	payments := router.Group("/payments", mwJWTAccess)
	payments.Get("/summary", controller.Summary)
}
