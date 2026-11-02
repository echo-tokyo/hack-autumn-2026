package usecase

import (
	"context"
	"fmt"

	"backend/config"
	"backend/internal/app/entity"
	occurrence "backend/internal/app/payment_occurrence"
	recurringpayment "backend/internal/app/recurring_payment"
	"backend/internal/pkg/db/transaction"
	utilstime "backend/internal/pkg/utils/time"
)

const _maxBackfillOccurrences = 120 // max amount of overdue occurrences on payment creation

// Ensure UCAdminClient implements both usecase interfaces.
var _ recurringpayment.UsecaseAdmin = (*UCAdminClient)(nil)
var _ recurringpayment.UsecaseClient = (*UCAdminClient)(nil)

// UCAdminClient is a recurring payment usecase for admin and client.
// It implements the [UsecaseAdmin] and the [UsecaseClient] interfaces.
type UCAdminClient struct {
	cfg       *config.Config
	txManager *transaction.TxManager
	repo      recurringpayment.RepositoryDB
	occRepo   occurrence.RepositoryDB
}

// NewUCAdminClient returns a new instance of [UCAdminClient].
func NewUCAdminClient(cfg *config.Config, txManager *transaction.TxManager,
	repo recurringpayment.RepositoryDB, occRepo occurrence.RepositoryDB) *UCAdminClient {

	return &UCAdminClient{
		cfg:       cfg,
		txManager: txManager,
		repo:      repo,
		occRepo:   occRepo,
	}
}

// Create creates a new recurring payment, actual occurrence and backfill occurrences.
func (u *UCAdminClient) Create(payment *entity.RecurringPayment) error {
	return u.txManager.WithTransaction(func(ctx context.Context) error {
		// TODO: context with tx
		if err := u.repo.Create(context.Background(), payment); err != nil {
			return fmt.Errorf("create recurring payment: %w", err)
		}
		if err := u.createInitialOccurrences(ctx, payment); err != nil {
			return fmt.Errorf("create occurrences: %w", err)
		}
		return nil
	})
}

// Delete soft-deletes recurring payment.
func (u *UCAdminClient) Delete(id int32) error {
	return u.repo.Delete(context.Background(), id)
}

// List returns all active recurring payments.
func (u *UCAdminClient) List() ([]*entity.RecurringPayment, error) {
	return u.repo.List(context.Background())
}

// createInitialOccurrences creates all occurrences with due_date < today and
// one occurrence with due_date >= today.
func (u *UCAdminClient) createInitialOccurrences(ctx context.Context,
	payment *entity.RecurringPayment) error {

	today := utilstime.Today(u.cfg.Timezone)
	due := utilstime.DateOnly(payment.StartDate)

	for range _maxBackfillOccurrences {
		isCurrent := !due.Before(today) // due >= today

		occ := &entity.PaymentOccurrence{
			RecurringPaymentID: payment.ID,
			Amount:             payment.Amount,
			Currency:           payment.Currency,
			DueDate:            due,
		}
		// err := u.occRepo.Create(ctx, occ) TODO: context with tx
		err := u.occRepo.Create(occ)
		if err != nil {
			return fmt.Errorf("create occurrence due %s: %w", occ.DueDateFmt(), err)
		}
		if isCurrent {
			return nil
		}
		due = utilstime.ComputeNextDeadline(int(payment.BillingDay), due)
	}
	return fmt.Errorf("%w: backfill limit %d exceeded",
		recurringpayment.ErrDateTooFar, _maxBackfillOccurrences)
}
