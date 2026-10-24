package usecase

import (
	"fmt"
	"time"

	"backend/config"
	"backend/internal/app/entity"
	occurrence "backend/internal/app/payment_occurrence"
)

// Ensure UC implements interface.
var _ occurrence.Usecase = (*UC)(nil)

// UC is a payment occurrence usecase.
// It implements the [Usecase] interface.
type UC struct {
	cfg  *config.Config
	repo occurrence.RepositoryDB
}

// NewUC returns a new instance of [UC].
func NewUC(cfg *config.Config, repo occurrence.RepositoryDB) *UC {
	return &UC{
		cfg:  cfg,
		repo: repo,
	}
}

// List returns occurrences matching filter.
// IsOverdue is computed for each.
func (u *UC) List(filter occurrence.ListFilter) ([]*entity.PaymentOccurrence, error) {
	today, err := u.today()
	if err != nil {
		return nil, fmt.Errorf("resolve today: %w", err)
	}

	// Inject today into filter so repository can compute paid/unpaid/overdue.
	filter.Today = today

	occurrences, err := u.repo.List(filter)
	if err != nil {
		return nil, fmt.Errorf("list: %w", err)
	}

	for _, occ := range occurrences {
		occ.IsOverdue, occ.OverdueDays = computeOverdue(occ, today)
	}

	return occurrences, nil
}

// GetByID returns occurrence by given id.
func (u *UC) GetByID(id int32) (*entity.PaymentOccurrence, error) {
	if id <= 0 {
		return nil, fmt.Errorf("%w: id must be positive", occurrence.ErrInvalidArgument)
	}

	occ, err := u.repo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("get by id: %w", err)
	}

	today, err := u.today()
	if err != nil {
		return nil, fmt.Errorf("resolve today: %w", err)
	}

	occ.IsOverdue, occ.OverdueDays = computeOverdue(occ, today)
	return occ, nil
}

// Update applies payment status changes.
func (u *UC) Update(id int32, input occurrence.UpdateInput) (*entity.PaymentOccurrence, error) {
	if id <= 0 {
		return nil, fmt.Errorf("%w: id must be positive", occurrence.ErrInvalidArgument)
	}
	if input.IsPaid == nil && input.PaymentDate == nil {
		return nil, fmt.Errorf("%w: nothing to update", occurrence.ErrInvalidArgument)
	}

	occ, err := u.repo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("get by id: %w", err)
	}

	today, err := u.today()
	if err != nil {
		return nil, fmt.Errorf("resolve today: %w", err)
	}

	switch {
	case input.IsPaid != nil && !*input.IsPaid:
		// Unmark: clear payment date (per ТЗ).
		occ.IsPaid = false
		occ.PaymentDate = nil

	case input.IsPaid != nil && *input.IsPaid:
		// Mark as paid: use provided date or today.
		payDate := today
		if input.PaymentDate != nil {
			payDate = truncateToDate(*input.PaymentDate)
		}
		if payDate.After(today) {
			return nil, fmt.Errorf("%w: payment_date cannot be in the future", occurrence.ErrInvalidArgument)
		}
		occ.IsPaid = true
		occ.PaymentDate = &payDate

	case input.IsPaid == nil && input.PaymentDate != nil:
		// Fixing date only — occurrence must already be paid.
		if !occ.IsPaid {
			return nil, fmt.Errorf(
				"%w: cannot set payment_date for unpaid occurrence",
				occurrence.ErrInvalidArgument,
			)
		}
		payDate := truncateToDate(*input.PaymentDate)
		if payDate.After(today) {
			return nil, fmt.Errorf("%w: payment_date cannot be in the future", occurrence.ErrInvalidArgument)
		}
		occ.PaymentDate = &payDate
	}

	if err := u.repo.Update(occ); err != nil {
		return nil, fmt.Errorf("update: %w", err)
	}

	occ.IsOverdue, occ.OverdueDays = computeOverdue(occ, today)
	return occ, nil
}

func (u *UC) Summary() ([]occurrence.CurrencySummary, error) {
	today, err := u.today()
	if err != nil {
		return nil, fmt.Errorf("resolve today: %w", err)
	}

	raw, err := u.repo.Summary(today)
	if err != nil {
		return nil, fmt.Errorf("summary: %w", err)
	}

	// Always return all three currencies, even if there are no rows for
	// some of them. The frontend can render a stable 3-row table without
	// null-checks. Zero-value decimal.Decimal equals 0.
	result := []occurrence.CurrencySummary{
		{Currency: entity.CurrencyRUB},
		{Currency: entity.CurrencyUSD},
		{Currency: entity.CurrencyEUR},
	}
	for i, cs := range result {
		if got, ok := raw[cs.Currency]; ok {
			result[i] = got
		}
	}

	return result, nil
}

// today returns current date (00:00:00) in configured timezone.
func (u *UC) today() (time.Time, error) {
	now := time.Now().In(u.cfg.Timezone)
	return time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, u.cfg.Timezone), nil
}

// computeOverdue returns whether the occurrence is overdue and
// for how many calendar days it has been overdue as of today.
func computeOverdue(occ *entity.PaymentOccurrence, today time.Time) (bool, int32) {
	if occ.IsPaid {
		return false, 0
	}

	dueDate := time.Date(
		occ.DueDate.Year(), occ.DueDate.Month(), occ.DueDate.Day(),
		0, 0, 0, 0, time.UTC,
	)
	todayDate := time.Date(
		today.Year(), today.Month(), today.Day(),
		0, 0, 0, 0, time.UTC,
	)

	if !todayDate.After(dueDate) {
		// today <= due_date: not overdue yet (or exactly on due date).
		return false, 0
	}

	days := int32(todayDate.Sub(dueDate).Hours() / 24)
	return true, days
}

// truncateToDate returns time at 00:00:00 UTC of the same calendar day.
func truncateToDate(t time.Time) time.Time {
	return time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, time.UTC)
}

// ComputeNextDueDate returns the next due date after 'from' for a payment
// that bills on 'billingDay' each month.
func ComputeNextDueDate(billingDay int, from time.Time) time.Time {
	year, month, _ := from.Date()
	nextMonth := month + 1
	nextYear := year
	if nextMonth > 12 {
		nextMonth = 1
		nextYear++
	}

	// Last day of target month: time.Date(year, month+1, 0, ...)
	// returns last day of 'month' because day=0 means "day before the 1st".
	lastDay := time.Date(nextYear, nextMonth+1, 0, 0, 0, 0, 0, time.UTC).Day()
	actualDay := billingDay
	if actualDay > lastDay {
		actualDay = lastDay
	}

	return time.Date(nextYear, nextMonth, actualDay, 0, 0, 0, 0, time.UTC)
}
