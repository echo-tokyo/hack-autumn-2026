package v1

import (
	"backend/internal/app/entity"
	"backend/internal/pkg/serialize"
	"backend/internal/pkg/validator"
	"errors"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/shopspring/decimal"
)

const _dateFmt = "2006-01-02"

// @description idPath represents a data with ID in path params.
type idPath struct {
	ID int32 `params:"id" validate:"required,numeric" example:"2"`
}

// @description recurringPaymentBody represents input for creating a recurring payment.
type recurringPaymentBody struct {
	// payment name
	Name string `json:"name" validate:"required,max=255" example:"Аренда офиса" maxLength:"255"`
	// payment amount
	AmountRaw float64         `json:"amount" validate:"required,min=0" example:"50000"`
	Amount    decimal.Decimal `json:"-" validate:"-"`
	// payment currency
	Currency entity.Currency `json:"currency" validate:"required,oneof=RUB USD EUR" example:"RUB" enums:"RUB,USD,EUR"`
	// day of month when payment is due (1-31)
	BillingDay int32 `json:"billingDay" validate:"required,min=1,max=31" example:"31" minimum:"1" maximum:"31"`
	// date of the first payment, YYYY-MM-DD
	StartDateRaw string    `json:"startDate" validate:"required,datetime=2006-01-02" example:"2026-10-31"`
	StartDate    time.Time `json:"-" validate:"-"`
}

func (r *recurringPaymentBody) Parser(ctx *fiber.Ctx) serialize.Parser {
	return func(out any) error {
		data, ok := out.(*recurringPaymentBody)
		if !ok {
			return errors.New("invalid data type")
		}

		if err := ctx.BodyParser(data); err != nil {
			return err
		}
		var err error
		data.StartDate, err = time.Parse(_dateFmt, data.StartDateRaw)
		if err != nil {
			return fmt.Errorf("%w: invalid startDate: %s", validator.ErrValidate, err.Error())
		}
		if !data.Currency.Valid() {
			return fmt.Errorf("%w: invalid currency", validator.ErrValidate)
		}
		data.Amount = decimal.NewFromFloat(data.AmountRaw)
		return nil
	}
}
