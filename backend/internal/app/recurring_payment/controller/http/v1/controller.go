// Package v1 is a first version of recurring payment HTTP-controller.
// It provides controller with handlers for client-accessible routes.
package v1

import (
	"fmt"

	fiber "github.com/gofiber/fiber/v2"

	payment "backend/internal/app/recurring_payment"
	"backend/internal/pkg/validator"
)

// RecurringPaymentController handles client-accessible recurring payment routes.
type RecurringPaymentController struct {
	valid validator.Validator
	uc    payment.UsecaseClient
}

// NewController returns a new instance of [RecurringPaymentController].
func NewController(uc payment.UsecaseClient, valid validator.Validator) *RecurringPaymentController {
	return &RecurringPaymentController{
		valid: valid,
		uc:    uc,
	}
}

//	@summary		Список регулярных платежей.
//	@description	Возвращает все активные (не удалённые) регулярные платежи.
//	@router			/recurring-payments [get]
//	@id				recurring-payments-list
//	@tags			recurring-payments
//	@accept			json
//	@produce		json
//	@security		JWTAccess
//	@success		200	{array}	entity.RecurringPayment
//	@failure		401	"неверный токен (пустой, истекший или неверный формат)"
//	@failure		500	"внутренняя ошибка"
func (c *RecurringPaymentController) List(ctx *fiber.Ctx) error {
	payments, err := c.uc.List()
	if err != nil {
		return fmt.Errorf("list: %w", err)
	}
	return ctx.Status(fiber.StatusOK).JSON(payments)
}
