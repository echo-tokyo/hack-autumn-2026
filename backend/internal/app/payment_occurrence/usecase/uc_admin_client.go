package usecase

import (
	"context"
	"fmt"
	"time"

	"backend/config"
	"backend/internal/app/entity"
	occurrence "backend/internal/app/payment_occurrence"
	utilstime "backend/internal/pkg/utils/time"
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

// GetByID returns occurrence by given id.
func (u *UC) GetByID(id int32) (*entity.PaymentOccurrence, error) {
	occ, err := u.repo.GetByID(context.Background(), id)
	if err != nil {
		return nil, fmt.Errorf("get by id: %w", err)
	}

	today := utilstime.Today(u.cfg.Timezone)
	occ.IsOverdue, occ.OverdueDays = computeOverdue(occ, today)
	return occ, nil
}

// Update applies payment status changes. Returns updated occurrence.
func (u *UC) Update(id int32, updates *entity.OccUpdate) (*entity.PaymentOccurrence, error) {
	occ, err := u.repo.GetByID(context.Background(), id)
	if err != nil {
		return nil, fmt.Errorf("get by id: %w", err)
	}

	today := utilstime.Today(u.cfg.Timezone)
	if err := u.updateCases(today, updates, occ); err != nil {
		return nil, err
	}

	if err := u.repo.Update(context.Background(), occ); err != nil {
		return nil, fmt.Errorf("update: %w", err)
	}
	occ.IsOverdue, occ.OverdueDays = computeOverdue(occ, today)
	return occ, nil
}

// List returns occurrences matching filter.
func (u *UC) List(filter *entity.OccListFilter) ([]*entity.PaymentOccurrence, error) {
	today := utilstime.Today(u.cfg.Timezone)
	// inject today into filter so repository can compute paid/unpaid/overdue.
	filter.Today = utilstime.FormatDate(today)

	occurrences, err := u.repo.List(context.Background(), filter)
	if err != nil {
		return nil, fmt.Errorf("list: %w", err)
	}

	for _, occ := range occurrences {
		occ.IsOverdue, occ.OverdueDays = computeOverdue(occ, today)
	}
	return occurrences, nil
}

// Summary returns total amounts grouped by currency.
func (u *UC) Summary() ([]entity.OccSummary, error) {
	todayDate := utilstime.FormatDate(utilstime.Today(u.cfg.Timezone))
	result, err := u.repo.Summary(context.Background(), todayDate)
	if err != nil {
		return nil, fmt.Errorf("summary: %w", err)
	}
	return result, nil
}

func (u *UC) updateCases(today time.Time, updates *entity.OccUpdate,
	occ *entity.PaymentOccurrence) error {

	switch {
	case updates.IsPaid != nil && !*updates.IsPaid:
		occ.IsPaid = false
		occ.PaymentDate = nil

	case updates.IsPaid != nil && *updates.IsPaid:
		payDate := today
		if updates.PaymentDate != nil {
			payDate = utilstime.DateOnly(*updates.PaymentDate)
		}
		occ.IsPaid = true
		occ.PaymentDate = &payDate

	case updates.IsPaid == nil && updates.PaymentDate != nil:
		if !occ.IsPaid {
			return fmt.Errorf("%w: cannot set payment_date for unpaid occurrence",
				occurrence.ErrInvalidData)
		}
		payDate := utilstime.DateOnly(*updates.PaymentDate)
		occ.PaymentDate = &payDate
	}
	return nil
}

// computeOverdue returns whether the occurrence is currently overdue
// and the number of days it has been (or was) overdue.
func computeOverdue(occ *entity.PaymentOccurrence,
	today time.Time) (isOverdue bool, overdueDays int32) {

	due := utilstime.DateOnly(occ.DueDate)

	if occ.IsPaid {
		// treat as paid on due date.
		if occ.PaymentDate == nil {
			return false, 0
		}
		paid := utilstime.DateOnly(*occ.PaymentDate)
		// paid on time or early
		if !paid.After(due) {
			return false, 0
		}
		return false, utilstime.DaysBetween(paid, due)
	}

	// not yet due, or exactly on due date
	if !today.After(due) {
		return false, 0
	}
	return true, utilstime.DaysBetween(today, due)
}
