// Package v1 is a first version of payment occurrence HTTP-controller.
// It provides controller with handlers for list, view, update, and summary.
package v1

import (
	"errors"
	"fmt"
	"time"

	fiber "github.com/gofiber/fiber/v2"

	"backend/config"
	occurrence "backend/internal/app/payment_occurrence"
	"backend/internal/pkg/serialize"
	"backend/internal/pkg/validator"
)

// PaymentOccurrenceController handles payment occurrence routes.
type PaymentOccurrenceController struct {
	valid    validator.Validator
	uc       occurrence.Usecase
	timezone *time.Location
}

// NewController returns a new instance of [PaymentOccurrenceController].
func NewController(cfg *config.Config, uc occurrence.Usecase,
	valid validator.Validator) *PaymentOccurrenceController {

	return &PaymentOccurrenceController{
		valid:    valid,
		uc:       uc,
		timezone: cfg.Timezone,
	}
}

// @summary		Получить период регулярного платежа.
// @description	Возвращает конкретный период регулярного платежа по id.
// @router			/payment-occurrences/{id} [get]
// @id				payment-occurrences-get
// @tags			payment-occurrences
// @accept			json
// @produce		json
// @security		JWTAccess
// @param			id	path		int	true	"id периода"
// @success		200	{object}	entity.PaymentOccurrence
// @failure		401	"неверный токен (пустой, истекший или неверный формат)"
// @failure		404	"период не найден"
func (c *PaymentOccurrenceController) GetByID(ctx *fiber.Ctx) error {
	inputPath := &idPath{}
	if err := serialize.Deserialize(inputPath, ctx.ParamsParser, c.valid.Validate); err != nil {
		return err
	}

	occ, err := c.uc.GetByID(inputPath.ID)
	if errors.Is(err, occurrence.ErrNotFound) {
		return fiber.NewError(fiber.StatusNotFound, err.Error())
	}
	if err != nil {
		return fmt.Errorf("get by id: %w", err)
	}

	return ctx.Status(fiber.StatusOK).JSON(occ)
}

// @summary		Обновить оплату периода.
// @description	Подтверждение/отмена оплаты и исправление фактической даты оплаты.
// @router			/payment-occurrences/{id} [patch]
// @id				payment-occurrences-update
// @tags			payment-occurrences
// @accept			json
// @produce		json
// @security		JWTAccess
// @param			id		path		int						true	"id периода"
// @param			request	body		updateOccurrenceBody	true	"изменения статуса и/или даты оплаты"
// @success		200		{object}	entity.PaymentOccurrence
// @failure		401	"неверный токен (пустой, истекший или неверный формат)"
// @failure		404		"период не найден"
func (c *PaymentOccurrenceController) Update(ctx *fiber.Ctx) error {
	inputPath := &idPath{}
	if err := serialize.Deserialize(inputPath, ctx.ParamsParser, c.valid.Validate); err != nil {
		return err
	}

	body := &updateOccurrenceBody{}
	bodyValidator := body.Validator(c.valid, c.timezone)
	if err := serialize.Deserialize(body, ctx.BodyParser, bodyValidator); err != nil {
		return err
	}

	occ, err := c.uc.Update(inputPath.ID, body.ToEntity())
	if errors.Is(err, occurrence.ErrNotFound) {
		return fiber.NewError(fiber.StatusNotFound, err.Error())
	}
	if err != nil {
		return fmt.Errorf("update: %w", err)
	}

	return ctx.Status(fiber.StatusOK).JSON(occ)
}

// @summary		Список периодов регулярных платежей.
// @description	Возвращает периоды с фильтрами по родительскому платежу, валюте и статусу.
// @router			/payment-occurrences [get]
// @id				payment-occurrences-list
// @tags			payment-occurrences
// @accept			json
// @produce		json
// @security		JWTAccess
// @param			recurring_payment_id	query	int		false	"фильтр по id регулярного платежа"
// @param			currency				query	string	false	"фильтр по валюте"	Enums(RUB,USD,EUR)
// @param			status					query	string	false	"фильтр по статусу"	Enums(paid,unpaid,overdue)
// @success		200						{array}	entity.PaymentOccurrence
// @failure		401	"неверный токен (пустой, истекший или неверный формат)"
func (c *PaymentOccurrenceController) List(ctx *fiber.Ctx) error {
	filter := &occListFilterQuery{}
	if err := serialize.Deserialize(filter, ctx.QueryParser, c.valid.Validate); err != nil {
		return err
	}

	occurrences, err := c.uc.List(filter.ToEntity())
	if err != nil {
		return fmt.Errorf("list: %w", err)
	}

	return ctx.Status(fiber.StatusOK).JSON(occurrences)
}

// @summary		Итоговые суммы по валютам.
// @description	Суммарные расходы по каждой валюте: к оплате, просрочено, оплачено.
// @router			/payments/summary [get]
// @id				payments-summary
// @tags			payments
// @accept			json
// @produce		json
// @security		JWTAccess
// @success		200	{array}	occurrence.CurrencySummary	"всегда 3 элемента: RUB, USD, EUR"
// @failure		401	"неверный токен (пустой, истекший или неверный формат)"
func (c *PaymentOccurrenceController) Summary(ctx *fiber.Ctx) error {
	summary, err := c.uc.Summary()
	if err != nil {
		return fmt.Errorf("summary: %w", err)
	}
	return ctx.Status(fiber.StatusOK).JSON(summary)
}
