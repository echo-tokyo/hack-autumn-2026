package usecase

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"backend/config"
	"backend/internal/app/entity"
	occurrence "backend/internal/app/payment_occurrence"
	payment "backend/internal/app/recurring_payment"
	utilstime "backend/internal/pkg/utils/time"
)

const _maxBackfillOccurrences = 120

// Ensure UCAdminClient implements both usecase interfaces.
var _ payment.UsecaseAdmin = (*UCAdminClient)(nil)
var _ payment.UsecaseClient = (*UCAdminClient)(nil)

// UCAdminClient is a recurring payment usecase for admin and client.
// It implements the [UsecaseAdmin] and the [UsecaseClient] interfaces.
type UCAdminClient struct {
	cfg     *config.Config
	repo    payment.RepositoryDB
	occRepo occurrence.RepositoryDB
}

// NewUCAdminClient returns a new instance of [UCAdminClient].
func NewUCAdminClient(cfg *config.Config, repo payment.RepositoryDB,
	occRepo occurrence.RepositoryDB) *UCAdminClient {

	return &UCAdminClient{
		cfg:     cfg,
		repo:    repo,
		occRepo: occRepo,
	}
}

// List returns all active recurring payments.
func (u *UCAdminClient) List() ([]*entity.RecurringPayment, error) {
	payments, err := u.repo.List()
	if err != nil {
		return nil, fmt.Errorf("list: %w", err)
	}
	return payments, nil
}

// Create creates a new recurring payment and its first occurrence.
func (u *UCAdminClient) Create(rp *entity.RecurringPayment) error {
	if err := validateRecurringPayment(rp); err != nil {
		return fmt.Errorf("validate: %w", err)
	}

	if err := u.repo.Create(rp); err != nil {
		return fmt.Errorf("create recurring payment: %w", err)
	}

	today, err := u.today()
	if err != nil {
		_ = u.repo.SoftDelete(rp.ID)
		return fmt.Errorf("resolve today: %w", err)
	}

	if err := u.createInitialOccurrences(rp, today); err != nil {
		// compensation: hide the orphan recurring payment.
		// Created occurrences stay in DB as history, but they are not
		// visible because List filters by is_deleted = false.
		_ = u.repo.SoftDelete(rp.ID)
		return fmt.Errorf("create initial occurrences: %w", err)
	}

	return nil
}

// Delete soft-deletes recurring payment.
func (u *UCAdminClient) Delete(id int32) error {
	if id <= 0 {
		return fmt.Errorf("%w: id must be positive", payment.ErrInvalidArgument)
	}
	if err := u.repo.SoftDelete(id); err != nil {
		return fmt.Errorf("delete: %w", err)
	}
	return nil
}

// validateRecurringPayment validates input for Create.
// It does not touch the DB and does not depend on cfg / timezone.
func validateRecurringPayment(rp *entity.RecurringPayment) error {
	if rp == nil {
		return fmt.Errorf("%w: payment is nil", payment.ErrInvalidArgument)
	}
	if strings.TrimSpace(rp.Name) == "" {
		return fmt.Errorf("%w: name is required", payment.ErrInvalidArgument)
	}
	if len([]rune(rp.Name)) > 255 {
		return fmt.Errorf("%w: name is too long (max 255)", payment.ErrInvalidArgument)
	}
	if !rp.Amount.IsPositive() {
		return fmt.Errorf("%w: amount must be positive", payment.ErrInvalidArgument)
	}
	if rp.BillingDay < 1 || rp.BillingDay > 31 {
		return fmt.Errorf("%w: billing_day must be in [1, 31]", payment.ErrInvalidArgument)
	}
	if rp.StartDate.IsZero() {
		return fmt.Errorf("%w: start_date is required", payment.ErrInvalidArgument)
	}
	return nil
}

// truncateToDateUTC returns date-only time in UTC.
func truncateToDateUTC(t time.Time) time.Time {
	return time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, time.UTC)
}

// createInitialOccurrences creates:
// - all occurrences with due_date < today (backfill: overdue periods);
// - one occurrence with due_date >= today (current upcoming period).
func (u *UCAdminClient) createInitialOccurrences(
	rp *entity.RecurringPayment,
	today time.Time,
) error {
	due := truncateToDateUTC(rp.StartDate)

	for i := 0; i < _maxBackfillOccurrences; i++ {
		isCurrent := !due.Before(today) // due >= today

		occ := &entity.PaymentOccurrence{
			RecurringPaymentID: rp.ID,
			Amount:             rp.Amount,
			Currency:           rp.Currency,
			DueDate:            due,
			// Historical (past) occurrences are not to be reminded about.
			IsNotified: due.Before(today.AddDate(0, 0, -u.cfg.Telegram.ReminderLeadDays)),
		}

		if err := u.occRepo.Create(occ); err != nil {
			if !errors.Is(err, occurrence.ErrAlreadyExists) {
				return fmt.Errorf(
					"create occurrence due %s: %w",
					due.Format("2006-01-02"), err,
				)
			}
			// already exists — fine (race or re-run), advance and continue.
		}
		if isCurrent {
			return nil
		}
		due = utilstime.ComputeNextDueDate(int(rp.BillingDay), due)
	}
	return fmt.Errorf(
		"%w: backfill limit %d exceeded (start_date too far in the past)",
		payment.ErrInvalidArgument, _maxBackfillOccurrences,
	)
}

// today returns current date (00:00:00 UTC) in configured timezone,
// normalized to UTC midnight so that DATE comparisons are exact.
func (u *UCAdminClient) today() (time.Time, error) {
	now := time.Now().In(u.cfg.Timezone)
	return time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC), nil
}
