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
	occurrencerepo "backend/internal/app/payment_occurrence/repository"
	payment "backend/internal/app/recurring_payment"
	paymentrepo "backend/internal/app/recurring_payment/repository"
	"backend/internal/pkg/db"
	utilstime "backend/internal/pkg/utils/time"
)

const (
	_maxConsecutiveFailures = 5
	_maxOccurrencesPerRP    = 24
	// _interval               = 24 * time.Hour
	_interval  = 2 * time.Minute
	_lookahead = 60 * 24 * time.Hour
)

// Occurrence ensures each active recurring payment has enough payment
// occurrences generated ahead of time.
type Occurrence struct {
	cfg       *config.Config
	rpRepo    payment.RepositoryDB
	occRepo   occurrence.RepositoryDB
	lookahead time.Duration
	interval  time.Duration

	started chan struct{}
	exited  chan struct{}
}

// New returns a new instance of [Occurrence].
func New(cfg *config.Config, dbStorage *db.DB) *Occurrence {
	rpRepo := paymentrepo.NewRepoDB(dbStorage)
	occRepo := occurrencerepo.NewRepoDB(dbStorage)

	return &Occurrence{
		cfg:       cfg,
		rpRepo:    rpRepo,
		occRepo:   occRepo,
		started:   make(chan struct{}),
		exited:    make(chan struct{}),
		lookahead: _lookahead,
		interval:  _interval,
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

	// runOnce with failure accounting.
	run := func() (continueRunning bool) {
		if err := s.runOnce(ctx); err != nil {
			if errors.Is(err, context.Canceled) || errors.Is(err, context.DeadlineExceeded) {
				return false
			}
			failures++
			slog.Error("occurrence generator: run failed",
				"err", err,
				"consecutive_failures", failures,
			)
			if failures >= _maxConsecutiveFailures {
				select {
				case errChan <- fmt.Errorf("occurrence generator: %d consecutive failures: %w", failures, err):
				default:
				}
				return false
			}
			return true
		}
		failures = 0
		return true
	}

	// Immediate run on startup, then periodic.
	if !run() {
		return
	}

	ticker := time.NewTicker(s.interval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			if !run() {
				return
			}
		}
	}
}

// runOnce scans all active recurring payments and creates missing
// occurrences up to now + lookahead.
func (s *Occurrence) runOnce(ctx context.Context) error {
	if err := ctx.Err(); err != nil {
		return err
	}

	payments, err := s.rpRepo.List()
	if err != nil {
		return fmt.Errorf("list recurring payments: %w", err)
	}

	now := time.Now().UTC()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)
	deadline := today.Add(s.lookahead)

	for _, rp := range payments {
		if err := ctx.Err(); err != nil {
			return err
		}
		if err := s.ensureFor(ctx, rp, today, deadline); err != nil {
			// Per-payment errors do not abort the whole run;
			// log and continue with the rest.
			slog.Error("occurrence generator: ensure for payment failed",
				"recurring_payment_id", rp.ID,
				"err", err,
			)
		}
	}

	return nil
}

// ensureFor guarantees that recurring payment rp has occurrences up to
// deadline. Creates missing ones in a loop.
func (s *Occurrence) ensureFor(
	ctx context.Context,
	rp *entity.RecurringPayment,
	today time.Time,
	deadline time.Time,
) error {
	latest, err := s.occRepo.GetLatestByRecurringPayment(rp.ID)
	if errors.Is(err, occurrence.ErrNotFound) {
		// Defensive: normally the first occurrence is created inside
		// RecurringPayment.Create. If it is missing (race, migration,
		// partial failure) — create it now.
		first := &entity.PaymentOccurrence{
			RecurringPaymentID: rp.ID,
			Amount:             rp.Amount,
			Currency:           rp.Currency,
			DueDate:            truncateToDateUTC(rp.StartDate),
			// If rp started in the past, do not send a reminder for it —
			// it is a history record.
			IsNotified: rp.StartDate.Before(today),
		}
		if err := s.occRepo.Create(first); err != nil {
			if errors.Is(err, occurrence.ErrAlreadyExists) {
				// Someone else created it. Re-fetch.
				latest, err = s.occRepo.GetLatestByRecurringPayment(rp.ID)
				if err != nil {
					return fmt.Errorf("get latest after race: %w", err)
				}
			} else {
				return fmt.Errorf("create first occurrence: %w", err)
			}
		} else {
			latest = first
		}
	} else if err != nil {
		return fmt.Errorf("get latest occurrence: %w", err)
	}

	latestDue := truncateToDateUTC(latest.DueDate)

	// Generate missing occurrences until latest >= deadline.
	for i := 0; latestDue.Before(deadline) && i < _maxOccurrencesPerRP; i++ {
		if err := ctx.Err(); err != nil {
			return err
		}

		nextDue := utilstime.ComputeNextDueDate(int(rp.BillingDay), latestDue)

		occ := &entity.PaymentOccurrence{
			RecurringPaymentID: rp.ID,
			Amount:             rp.Amount,
			Currency:           rp.Currency,
			DueDate:            nextDue,
			// Historical catch-up: occurrence already past its due date
			// must not trigger a reminder flood.
			IsNotified: nextDue.Before(today),
		}

		if err := s.occRepo.Create(occ); err != nil {
			if errors.Is(err, occurrence.ErrAlreadyExists) {
				// Race with another generator or manual creation.
				// Advance and continue.
				latestDue = nextDue
				continue
			}
			return fmt.Errorf(
				"create occurrence due %s: %w",
				nextDue.Format("2006-01-02"), err,
			)
		}

		latestDue = nextDue
	}

	return nil
}

// truncateToDateUTC returns date-only time in UTC.
// due_date is a DATE column: we want the calendar day, not a moment in time.
func truncateToDateUTC(t time.Time) time.Time {
	return time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, time.UTC)
}
