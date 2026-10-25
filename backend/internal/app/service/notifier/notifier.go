package notifier

import (
	"context"
	"errors"
	"fmt"
	"html"
	"log/slog"
	"time"

	"backend/config"
	"backend/internal/app/entity"
	occurrence "backend/internal/app/payment_occurrence"
	occurrencerepo "backend/internal/app/payment_occurrence/repository"
	"backend/internal/pkg/db"
	"backend/internal/pkg/telegram"
)

const (
	_maxConsecutiveFailures = 5
	_maxNotificationsPerRun = 200
)

// Service sends payment reminders to a configured Telegram chat.
//
// Implements the app Service interface:
//
//	Started() <-chan struct{}
//	Exited()  <-chan struct{}
//	Run(ctx context.Context, errChan chan<- error)
type Service struct {
	cfg     *config.Config
	occRepo occurrence.RepositoryDB
	tg      *telegram.Client

	started  chan struct{}
	exited   chan struct{}
	interval time.Duration
	leadDays int
	loc      *time.Location
}

// New returns a new instance of [Service].
func New(
	cfg *config.Config,
	dbStorage *db.DB,
	tg *telegram.Client,
) (*Service, error) {

	interval := cfg.Telegram.Interval
	if interval <= 0 {
		interval = time.Hour
	}

	leadDays := cfg.Telegram.ReminderLeadDays
	if leadDays <= 0 {
		leadDays = 3
	}

	return &Service{
		cfg:      cfg,
		occRepo:  occurrencerepo.NewRepoDB(dbStorage),
		tg:       tg,
		started:  make(chan struct{}),
		exited:   make(chan struct{}),
		interval: interval,
		leadDays: leadDays,
		loc:      cfg.Timezone,
	}, nil
}

// Started returns chan that signals that service's readiness.
func (s *Service) Started() <-chan struct{} { return s.started }

// Exited returns chan that signals that service's exited.
func (s *Service) Exited() <-chan struct{} { return s.exited }

// Run starts service. Waits to context done to exit.
func (s *Service) Run(ctx context.Context, errChan chan<- error) {
	close(s.started)
	defer close(s.exited)

	failures := 0

	run := func() (continueRunning bool) {
		if err := s.runOnce(ctx); err != nil {
			if errors.Is(err, context.Canceled) || errors.Is(err, context.DeadlineExceeded) {
				return false
			}
			failures++
			slog.Error("reminder: run failed",
				"err", err,
				"consecutive_failures", failures,
			)
			if failures >= _maxConsecutiveFailures {
				select {
				case errChan <- fmt.Errorf("reminder: %d consecutive failures: %w", failures, err):
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

// runOnce sends reminders for all occurrences that need one.
//
// DB / config errors are returned (counted toward consecutive failures).
// Individual send failures are logged but do not abort the run: the
// occurrence stays is_notified=false and will be retried on the next tick.
func (s *Service) runOnce(ctx context.Context) error {
	if err := ctx.Err(); err != nil {
		return err
	}

	today := s.today()
	deadline := today.AddDate(0, 0, s.leadDays)

	occurrences, err := s.occRepo.ListToRemind(deadline)
	if err != nil {
		return fmt.Errorf("list to remind: %w", err)
	}

	if len(occurrences) == 0 {
		return nil
	}

	if len(occurrences) > _maxNotificationsPerRun {
		slog.Warn("reminder: truncating notifications",
			"total", len(occurrences),
			"limit", _maxNotificationsPerRun,
		)
		occurrences = occurrences[:_maxNotificationsPerRun]
	}

	slog.Info("reminder: sending notifications",
		"count", len(occurrences),
		"deadline", deadline.Format("2006-01-02"),
	)

	var sent, failed int

	for _, occ := range occurrences {
		if err := ctx.Err(); err != nil {
			return err
		}

		daysPast := daysPastDue(occ.DueDate, today)
		text := formatReminder(occ, daysPast, today)

		if err := s.tg.SendMessage(ctx, text); err != nil {
			failed++
			slog.Error("reminder: send failed",
				"occurrence_id", occ.ID,
				"recurring_payment_id", occ.RecurringPaymentID,
				"err", err,
			)
			// is_notified stays false → retry on next tick
			continue
		}
		sent++

		if err := s.occRepo.MarkNotified(occ.ID, time.Now().UTC()); err != nil {
			// Message was sent, but marking failed. Risk: duplicate next run.
			// At-least-once semantics — acceptable for this domain.
			slog.Error("reminder: mark notified failed",
				"occurrence_id", occ.ID,
				"err", err,
			)
		}
	}

	slog.Info("reminder: done", "sent", sent, "failed", failed)
	return nil
}

// today returns current calendar date in configured timezone,
// normalized to UTC midnight so that comparisons with DATE columns
// are exact (no timezone drift).
func (s *Service) today() time.Time {
	now := time.Now().In(s.loc)
	return time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)
}

// daysPastDue returns how many calendar days past due the date is.
// Returns 0 if dueDate >= today (not yet overdue or due today).
func daysPastDue(dueDate, today time.Time) int32 {
	due := time.Date(dueDate.Year(), dueDate.Month(), dueDate.Day(), 0, 0, 0, 0, time.UTC)
	t := time.Date(today.Year(), today.Month(), today.Day(), 0, 0, 0, 0, time.UTC)
	if !t.After(due) {
		return 0
	}
	return int32(t.Sub(due).Hours() / 24)
}

// formatReminder builds the Telegram message.
//
// Format (HTML):
//
//	💳 Напоминание об оплате
//
//	📌 Аренда офиса
//	💰 50000.00 RUB
//	📅 Срок: 31.10.2026
//
// If overdue, the last line is replaced with a warning.
func formatReminder(occ *entity.PaymentOccurrence, daysPast int32, today time.Time) string {
	name := occ.RecurringPaymentName
	if name == "" {
		name = fmt.Sprintf("Платёж #%d", occ.RecurringPaymentID)
	}

	dueDate := time.Date(occ.DueDate.Year(), occ.DueDate.Month(), occ.DueDate.Day(), 0, 0, 0, 0, time.UTC)

	var statusLine string
	switch {
	case daysPast > 0:
		statusLine = fmt.Sprintf(
			"⚠️ <b>ПРОСРОЧЕНО</b> на %d дн. (срок %s)",
			daysPast, dueDate.Format("02.01.2006"),
		)
	case dueDate.Equal(today):
		statusLine = "📅 <b>Срок сегодня</b>"
	default:
		statusLine = fmt.Sprintf("📅 Срок: %s", dueDate.Format("02.01.2006"))
	}

	return fmt.Sprintf(
		"💳 <b>Напоминание об оплате</b>\n\n"+
			"📌 %s\n"+
			"💰 %s %s\n"+
			"%s",
		html.EscapeString(name),
		occ.Amount.StringFixed(2),
		occ.Currency,
		statusLine,
	)
}
