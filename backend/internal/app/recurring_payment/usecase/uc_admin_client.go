package usecase

import (
	"fmt"
	"strings"
	"time"

	"backend/config"
	"backend/internal/app/entity"
	occurrence "backend/internal/app/payment_occurrence"
	payment "backend/internal/app/recurring_payment"
)

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

	occ := &entity.PaymentOccurrence{
		RecurringPaymentID: rp.ID,
		Amount:             rp.Amount,
		Currency:           rp.Currency,
		DueDate:            truncateToDateUTC(rp.StartDate),
		IsPaid:             false,
		IsNotified:         false,
	}
	if err := u.occRepo.Create(occ); err != nil {
		if delErr := u.repo.SoftDelete(rp.ID); delErr != nil {
			return fmt.Errorf(
				"create first occurrence: %w (compensation failed: %v)",
				err, delErr,
			)
		}
		return fmt.Errorf("create first occurrence: %w", err)
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
