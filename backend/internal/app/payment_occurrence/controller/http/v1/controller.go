// Package v1 is a first version of payment occurrence HTTP-controller.
// It provides controller with handlers for list, view, update, and summary.
package v1

import (
	"errors"
	"fmt"
	"maps"
	"strconv"
	"time"

	fiber "github.com/gofiber/fiber/v2"
	"github.com/shopspring/decimal"

	"backend/internal/app/entity"
	occurrence "backend/internal/app/payment_occurrence"
	"backend/internal/pkg/serialize"
	"backend/internal/pkg/validator"
)

// PaymentOccurrenceController handles payment occurrence routes.
type PaymentOccurrenceController struct {
	valid validator.Validator
	uc    occurrence.Usecase
}

// NewController returns a new instance of [PaymentOccurrenceController].
func NewController(uc occurrence.Usecase, valid validator.Validator) *PaymentOccurrenceController {
	return &PaymentOccurrenceController{
		valid: valid,
		uc:    uc,
	}
}

//	@summary		Список периодов регулярных платежей.
//	@description	Возвращает периоды с фильтрами по родительскому платежу, валюте и статусу.
//	@description	Для каждого периода вычисляется is_overdue.
//	@router			/payment-occurrences [get]
//	@id				payment-occurrences-list
//	@tags			payment-occurrences
//	@accept			json
//	@produce		json
//	@security		JWTAccess
//	@param			recurring_payment_id	query	int		false	"фильтр по id регулярного платежа"
//	@param			currency				query	string	false	"фильтр по валюте"	Enums(RUB,USD,EUR)
//	@param			status					query	string	false	"фильтр по статусу"	Enums(paid,unpaid,overdue)
//	@success		200						{array}	entity.PaymentOccurrence
//	@failure		400						"неверные параметры фильтрации"
//	@failure		401						"неверный токен"
//	@failure		500						"внутренняя ошибка"
func (c *PaymentOccurrenceController) List(ctx *fiber.Ctx) error {
	filter := occurrence.ListFilter{}

	if v := ctx.Query("recurring_payment_id"); v != "" {
		id, err := strconv.ParseInt(v, 10, 32)
		if err != nil || id <= 0 {
			return fmt.Errorf(
				"%w: invalid recurring_payment_id %q",
				validator.ErrValidate, v,
			)
		}
		id32 := int32(id)
		filter.RecurringPaymentID = &id32
	}

	if v := ctx.Query("currency"); v != "" {
		cur := entity.Currency(v)
		if !cur.Valid() {
			return fmt.Errorf(
				"%w: invalid currency %q (want RUB, USD or EUR)",
				validator.ErrValidate, v,
			)
		}
		filter.Currency = &cur
	}

	if v := ctx.Query("status"); v != "" {
		st := occurrence.Status(v)
		if !st.Valid() {
			return fmt.Errorf(
				"%w: invalid status %q (want paid, unpaid or overdue)",
				validator.ErrValidate, v,
			)
		}
		filter.Status = &st
	}

	occurrences, err := c.uc.List(filter)
	if err != nil {
		return fmt.Errorf("list: %w", err)
	}

	return ctx.Status(fiber.StatusOK).JSON(occurrences)
}

//	@summary		Получить период регулярного платежа.
//	@description	Возвращает конкретный период по id. Для периода вычисляется is_overdue.
//	@router			/payment-occurrences/{id} [get]
//	@id				payment-occurrences-get
//	@tags			payment-occurrences
//	@accept			json
//	@produce		json
//	@security		JWTAccess
//	@param			id	path		int	true	"id периода"
//	@success		200	{object}	entity.PaymentOccurrence
//	@failure		400	"неверный id"
//	@failure		401	"неверный токен"
//	@failure		404	"период не найден"
//	@failure		500	"внутренняя ошибка"
func (c *PaymentOccurrenceController) GetByID(ctx *fiber.Ctx) error {
	id, err := parseID(ctx.Params("id"))
	if err != nil {
		return err
	}

	occ, err := c.uc.GetByID(id)
	if errors.Is(err, occurrence.ErrInvalidArgument) {
		return fmt.Errorf("%w: %v", validator.ErrValidate, err)
	}
	if errors.Is(err, occurrence.ErrNotFound) {
		return fiber.NewError(fiber.StatusNotFound, err.Error())
	}
	if err != nil {
		return fmt.Errorf("get by id: %w", err)
	}

	return ctx.Status(fiber.StatusOK).JSON(occ)
}

//	@summary		Обновить оплату периода.
//	@description	Подтверждение/отмена оплаты и исправление фактической даты оплаты.
//	@description	Если is_paid=false — фактическая дата очищается.
//	@description	Если дата в будущем — ошибка 400.
//	@router			/payment-occurrences/{id} [patch]
//	@id				payment-occurrences-update
//	@tags			payment-occurrences
//	@accept			json
//	@produce		json
//	@security		JWTAccess
//	@param			id		path		int						true	"id периода"
//	@param			request	body		updateOccurrenceBody	true	"изменения статуса и/или даты оплаты"
//	@success		200		{object}	entity.PaymentOccurrence
//	@failure		400		"неверное тело запроса или значения"
//	@failure		401		"неверный токен"
//	@failure		404		"период не найден"
//	@failure		500		"внутренняя ошибка"
func (c *PaymentOccurrenceController) Update(ctx *fiber.Ctx) error {
	id, err := parseID(ctx.Params("id"))
	if err != nil {
		return err
	}

	body := &updateOccurrenceBody{}
	if err := serialize.Deserialize(body, ctx.BodyParser, c.valid.Validate); err != nil {
		return err
	}

	input := occurrence.UpdateInput{
		IsPaid: body.IsPaid,
	}
	if body.PaymentDate != nil {
		t, err := time.Parse("2006-01-02", *body.PaymentDate)
		if err != nil {
			return fmt.Errorf(
				"%w: invalid payment_date %q",
				validator.ErrValidate, *body.PaymentDate,
			)
		}
		input.PaymentDate = &t
	}

	occ, err := c.uc.Update(id, input)
	if errors.Is(err, occurrence.ErrInvalidArgument) {
		return fmt.Errorf("%w: %v", validator.ErrValidate, err)
	}
	if errors.Is(err, occurrence.ErrNotFound) {
		return fiber.NewError(fiber.StatusNotFound, err.Error())
	}
	if err != nil {
		return fmt.Errorf("update: %w", err)
	}

	return ctx.Status(fiber.StatusOK).JSON(occ)
}

//	@summary		Итоговые суммы по валютам.
//	@description	Возвращает суммарные расходы по всем периодам, сгруппированные по валютам.
//	@description	Конвертация не выполняется: суммы в RUB, USD и EUR считаются отдельно.
//	@router			/payments/summary [get]
//	@id				payments-summary
//	@tags			payments
//	@accept			json
//	@produce		json
//	@security		JWTAccess
//	@success		200	{object}	map[string]string	"суммы по валютам, ключи RUB, USD, EUR"
//	@failure		401	"неверный токен"
//	@failure		500	"внутренняя ошибка"
func (c *PaymentOccurrenceController) Summary(ctx *fiber.Ctx) error {
	summary, err := c.uc.Summary()
	if err != nil {
		return fmt.Errorf("summary: %w", err)
	}

	// Normalize: always return all three currencies, even if no payments.
	// Otherwise frontend gets {"RUB": "..."} without USD/EUR keys on empty DB
	// and may render undefined values.
	result := map[entity.Currency]decimal.Decimal{
		entity.CurrencyRUB: decimal.Zero,
		entity.CurrencyUSD: decimal.Zero,
		entity.CurrencyEUR: decimal.Zero,
	}
	maps.Copy(result, summary)

	return ctx.Status(fiber.StatusOK).JSON(result)
}

// parseID parses a positive int32 from string.
func parseID(s string) (int32, error) {
	id, err := strconv.ParseInt(s, 10, 32)
	if err != nil || id <= 0 {
		return 0, fmt.Errorf(
			"%w: invalid id %q",
			occurrence.ErrInvalidArgument, s,
		)
	}
	return int32(id), nil
}
