package occurrence

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"backend/config"
	"backend/internal/app/entity"
	occurrence "backend/internal/app/payment_occurrence"
	occurrencerepo "backend/internal/app/payment_occurrence/repo"
	recurringpayment "backend/internal/app/recurring_payment"
	paymentrepo "backend/internal/app/recurring_payment/repo"
	"backend/internal/pkg/db"
	utilstime "backend/internal/pkg/utils/time"
)

const (
	_maxConsecutiveFailures = 5
)

// Occurrence ensures each active recurring payment has enough payment
// occurrences generated ahead of time.
type Occurrence struct {
	cfg      *config.Config
	rpRepo   recurringpayment.RepositoryDB
	occRepo  occurrence.RepositoryDB
	interval time.Duration

	started chan struct{}
	exited  chan struct{}
}

// New returns a new instance of [Occurrence].
func New(cfg *config.Config, dbStorage *db.DB) *Occurrence {
	rpRepo := paymentrepo.NewDB(dbStorage)
	occRepo := occurrencerepo.NewDB(dbStorage)

	return &Occurrence{
		cfg:      cfg,
		rpRepo:   rpRepo,
		occRepo:  occRepo,
		started:  make(chan struct{}),
		exited:   make(chan struct{}),
		interval: cfg.App.Occurrence.GenInterval,
	}
}

// Started returns chan that signals that service's readiness.
func (s *Occurrence) Started() <-chan struct{} { return s.started }

// Exited returns chan that signals that service's exited.
func (s *Occurrence) Exited() <-chan struct{} { return s.exited }

// Run starts service. Waits to context done to exit.
func (s *Occurrence) Run(ctx context.Context, errChan chan<- error) {
	if s.interval <= 0 {
		slog.Error("occurrence generator: invalid interval", "interval", s.interval)
		close(s.started)
		close(s.exited)
		return
	}

	close(s.started)
	defer close(s.exited)

	failures := 0
	// Immediate run on startup, then periodic
	if !s.runOnceWithFailure(ctx, errChan, &failures) {
		return
	}

	ticker := time.NewTicker(s.interval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			if !s.runOnceWithFailure(ctx, errChan, &failures) {
				return
			}
		}
	}
}

// runOnceWithFailure execs runOnce and processes failures if it occurs.
func (s *Occurrence) runOnceWithFailure(ctx context.Context,
	errChan chan<- error, fails *int) bool {

	if err := s.runOnce(ctx); err != nil {
		if errors.Is(err, context.Canceled) || errors.Is(err, context.DeadlineExceeded) {
			return false
		}
		*fails++
		slog.Error("occurrence generator: run failed",
			"err", err,
			"consecutive_failures", *fails,
		)
		if *fails >= _maxConsecutiveFailures {
			select {
			case errChan <- fmt.Errorf("occurrence generator: %d fails: %w", *fails, err):
			default:
			}
			return false
		}
		return true
	}
	*fails = 0
	return true
}

// runOnce scans all active recurring payments and creates missing occurrences.
func (s *Occurrence) runOnce(ctx context.Context) error {
	today := utilstime.Today(time.UTC)

	payments, err := s.rpRepo.List(context.Background())
	if err != nil {
		return fmt.Errorf("list recurring payments: %w", err)
	}

	for _, payment := range payments {
		if err := ctx.Err(); err != nil {
			return err
		}
		if err := s.ensureFor(payment, today); err != nil {
			slog.Error("occurrence generator: ensure for payment failed",
				"recurring_payment_id", payment.ID,
				"err", err,
			)
		}
	}
	return nil
}

// ensureFor creates the next occurrence for recurring payment if
// its previous occurrence is due today or overdue.
func (s *Occurrence) ensureFor(payment *entity.RecurringPayment, today time.Time) error {
	latest, err := s.occRepo.GetLatestByPayment(context.Background(), payment.ID)
	if err != nil {
		return fmt.Errorf("get latest occurrence: %w", err)
	}

	latestDue := utilstime.DateOnly(latest.DueDate)
	if !latestDue.Before(today) {
		return nil
	}
	nextDue := utilstime.ComputeNextDeadline(int(payment.BillingDay), latestDue)

	occ := &entity.PaymentOccurrence{
		RecurringPaymentID: payment.ID,
		Amount:             payment.Amount,
		Currency:           payment.Currency,
		DueDate:            nextDue,
	}
	err = s.occRepo.Create(context.Background(), occ)
	if errors.Is(err, occurrence.ErrAlreadyExists) {
		return nil // already created in a previous run
	}
	if err != nil {
		return fmt.Errorf("create occurrence due %s: %w", utilstime.FormatDate(nextDue), err)
	}
	return nil
}
