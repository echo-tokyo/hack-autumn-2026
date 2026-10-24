package v1

import (
	"errors"
	"fmt"
	"time"

	fiber "github.com/gofiber/fiber/v2"

	"backend/internal/app/entity"
	payment "backend/internal/app/recurring_payment"
	"backend/internal/pkg/serialize"
	"backend/internal/pkg/validator"
)

// RecurringPaymentControllerAdmin handles admin-only recurring payment routes.
type RecurringPaymentControllerAdmin struct {
	valid validator.Validator
	uc    payment.UsecaseAdmin
}

// NewControllerAdmin returns a new instance of [RecurringPaymentControllerAdmin].
func NewControllerAdmin(uc payment.UsecaseAdmin, valid validator.Validator) *RecurringPaymentControllerAdmin {
	return &RecurringPaymentControllerAdmin{
		valid: valid,
		uc:    uc,
	}
}

// @summary		Создать регулярный платёж.
// @description	Создаёт регулярный платёж и первый период с датой StartDate.
// @router			/recurring-payments [post]
// @id				recurring-payments-create
// @tags			recurring-payments
// @accept			json
// @produce		json
// @security		JWTAccess
// @param			request	body		recurringPaymentBody	true	"данные нового регулярного платежа"
// @success		201		{object}	entity.RecurringPayment
// @failure		400		"неверное тело запроса или параметры"
// @failure		401		"неверный токен (пустой, истекший или неверный формат)"
// @failure		403		"требуется роль администратора"
// @failure		500		"внутренняя ошибка"
func (c *RecurringPaymentControllerAdmin) Create(ctx *fiber.Ctx) error {
	body := &recurringPaymentBody{}
	if err := serialize.Deserialize(body, ctx.BodyParser, c.valid.Validate); err != nil {
		return err
	}

	startDate, err := time.Parse("2006-01-02", body.StartDate)
	if err != nil {
		return fmt.Errorf("%w: invalid startDate: %v", validator.ErrValidate, err)
	}

	rp := &entity.RecurringPayment{
		Name:       body.Name,
		Amount:     body.Amount,
		Currency:   entity.Currency(body.Currency),
		BillingDay: body.BillingDay,
		StartDate:  startDate,
	}

	err = c.uc.Create(rp)
	if errors.Is(err, payment.ErrInvalidArgument) {
		return fmt.Errorf("%w: %v", validator.ErrValidate, err)
	}
	if err != nil {
		return fmt.Errorf("create: %w", err)
	}

	return ctx.Status(fiber.StatusCreated).JSON(rp)
}

// @summary		Удалить регулярный платёж.
// @description	Мягко удаляет регулярный платёж: напоминания прекращаются, история сохраняется.
// @router			/recurring-payments/{id} [delete]
// @id				recurring-payments-delete
// @tags			recurring-payments
// @accept			json
// @produce		json
// @security		JWTAccess
// @param			id	path	int	true	"id регулярного платежа"
// @success		204	"успешно удалён"
// @failure		400	"неверный id"
// @failure		401	"неверный токен (пустой, истекший или неверный формат)"
// @failure		403	"требуется роль администратора"
// @failure		404	"регулярный платёж не найден"
// @failure		500	"внутренняя ошибка"
func (c *RecurringPaymentControllerAdmin) Delete(ctx *fiber.Ctx) error {
	inputPath := &idPath{}
	if err := serialize.Deserialize(inputPath, ctx.ParamsParser, c.valid.Validate); err != nil {
		return err
	}

	err := c.uc.Delete(inputPath.ID)
	if errors.Is(err, payment.ErrInvalidArgument) {
		return fmt.Errorf("%w: %v", validator.ErrValidate, err)
	}
	if errors.Is(err, payment.ErrNotFound) {
		return fiber.NewError(fiber.StatusNotFound, err.Error())
	}
	if err != nil {
		return fmt.Errorf("delete: %w", err)
	}

	return ctx.SendStatus(fiber.StatusNoContent)
}
