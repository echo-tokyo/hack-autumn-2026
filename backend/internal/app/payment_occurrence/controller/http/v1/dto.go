package v1

import (
	"errors"
	"fmt"
	"time"

	"backend/internal/app/entity"
	"backend/internal/pkg/serialize"
	utilstime "backend/internal/pkg/utils/time"
	"backend/internal/pkg/validator"
)

const _dateFmt = "2006-01-02"

// @description idPath represents a data with ID in path params.
type idPath struct {
	ID int32 `params:"id" validate:"required,numeric" example:"2"`
}

// @description updateOccurrenceBody represents changes to apply to a payment occurrence.
type updateOccurrenceBody struct {
	// new payment status
	IsPaid *bool `json:"is_paid" example:"true"`
	// actual payment date (YYYY-MM-DD)
	PaymentDateRaw *string    `json:"payment_date" validate:"omitempty,datetime=2006-01-02" example:"2026-10-20"`
	PaymentDate    *time.Time `json:"-" validate:"-"`
}

func (u *updateOccurrenceBody) Validator(valid validator.Validator,
	timezone *time.Location) serialize.Validator {

	return func(out any) error {
		data, ok := out.(*updateOccurrenceBody)
		if !ok {
			return errors.New("invalid data type")
		}

		if err := valid.Validate(data); err != nil {
			return err
		}
		// parse payment date
		if data.PaymentDateRaw != nil {
			paymentDate, err := time.Parse(_dateFmt, *data.PaymentDateRaw)
			if err != nil {
				return fmt.Errorf("%w: invalid startDate: %s", validator.ErrValidate, err.Error())
			}
			data.PaymentDate = &paymentDate

			today := utilstime.Today(timezone)
			if utilstime.FormatDate(*data.PaymentDate) > utilstime.FormatDate(today) {
				return fmt.Errorf("%w: payment_date is in the future", validator.ErrValidate)
			}
		}
		if data.PaymentDateRaw == nil && data.IsPaid == nil {
			return fmt.Errorf("%w: nothing to update", validator.ErrValidate)
		}
		return nil
	}
}

func (u *updateOccurrenceBody) ToEntity() *entity.OccUpdate {
	return &entity.OccUpdate{
		IsPaid:      u.IsPaid,
		PaymentDate: u.PaymentDate,
	}
}

// @description occListFilterQuery represents filters for getting list of payment occurrences.
type occListFilterQuery struct {
	// ID of parent recurring payment
	RecurringPaymentID *int32 `query:"recurringPaymentId" json:"recurringPaymentId" validate:"omitempty" example:"2"`
	// payment currency
	Currency *entity.Currency `query:"currency" json:"currency" validate:"omitempty,oneof=RUB USD EUR" example:"USD"`
	// occurrence status
	Status *entity.Status `query:"status" json:"status" validate:"omitempty,oneof=paid unpaid overdue" example:"overdue"`
}

func (o *occListFilterQuery) ToEntity() *entity.OccListFilter {
	return &entity.OccListFilter{
		RecurringPaymentID: o.RecurringPaymentID,
		Currency:           o.Currency,
		Status:             o.Status,
	}
}
