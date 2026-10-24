package repository

import (
	"errors"
	"fmt"
	"time"

	"github.com/shopspring/decimal"
	"gorm.io/gorm"

	"backend/internal/app/entity"
	occurrence "backend/internal/app/payment_occurrence"
	"backend/internal/pkg/db"
)

// Ensure RepoDB implements interface.
var _ occurrence.RepositoryDB = (*RepoDB)(nil)

// RepoDB is a payment occurrence DB repo.
// It implements the [RepositoryDB] interface.
type RepoDB struct {
	dbStorage *db.DB
}

// NewRepoDB returns a new instance of [RepoDB].
func NewRepoDB(dbStorage *db.DB) *RepoDB {
	return &RepoDB{
		dbStorage: dbStorage,
	}
}

// Create creates a new payment occurrence.
func (r *RepoDB) Create(occ *entity.PaymentOccurrence) error {
	if err := r.dbStorage.Create(occ).Error; err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return fmt.Errorf(
				"occurrence for recurring_payment_id=%d due_date=%s: %w",
				occ.RecurringPaymentID,
				occ.DueDate.Format("2006-01-02"),
				occurrence.ErrAlreadyExists,
			)
		}
		return fmt.Errorf("create: %w", err)
	}
	return nil
}

func (r *RepoDB) GetByID(id int32) (*entity.PaymentOccurrence, error) {
	var occ entity.PaymentOccurrence

	err := r.dbStorage.
		Model(&entity.PaymentOccurrence{}).
		Select("payment_occurrences.*, recurring_payments.name AS recurring_payment_name").
		Joins("JOIN recurring_payments ON recurring_payments.id = payment_occurrences.recurring_payment_id").
		Where("payment_occurrences.id = ?", id).
		First(&occ).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, fmt.Errorf("occurrence with id %d: %w", id, occurrence.ErrNotFound)
	}
	if err != nil {
		return nil, fmt.Errorf("query by id %d: %w", id, err)
	}

	return &occ, nil
}

// List returns payment occurrences matching filter, ordered by due_date ascending.
func (r *RepoDB) List(filter occurrence.ListFilter) ([]*entity.PaymentOccurrence, error) {
	if filter.Status != nil && filter.Today.IsZero() {
		return nil, fmt.Errorf(
			"%w: filter.today is required for status filter",
			occurrence.ErrInvalidArgument,
		)
	}

	var occurrences []*entity.PaymentOccurrence

	q := r.dbStorage.
		Model(&entity.PaymentOccurrence{}).
		Select("payment_occurrences.*, recurring_payments.name AS recurring_payment_name").
		Joins("JOIN recurring_payments ON recurring_payments.id = payment_occurrences.recurring_payment_id").
		Where("recurring_payments.is_deleted = ?", false)

	if filter.RecurringPaymentID != nil {
		q = q.Where("payment_occurrences.recurring_payment_id = ?", *filter.RecurringPaymentID)
	}
	if filter.Currency != nil {
		q = q.Where("payment_occurrences.currency = ?", *filter.Currency)
	}
	if filter.Status != nil {
		today := filter.Today.Format("2006-01-02")
		switch *filter.Status {
		case occurrence.StatusPaid:
			q = q.Where("payment_occurrences.is_paid = ?", true)
		case occurrence.StatusUnpaid:
			q = q.Where(
				"payment_occurrences.is_paid = ? AND payment_occurrences.due_date >= ?",
				false, today,
			)
		case occurrence.StatusOverdue:
			q = q.Where(
				"payment_occurrences.is_paid = ? AND payment_occurrences.due_date < ?",
				false, today,
			)
		}
	}
	if err := q.
		Order("payment_occurrences.due_date ASC, payment_occurrences.id ASC").
		Find(&occurrences).Error; err != nil {
		return nil, fmt.Errorf("list: %w", err)
	}

	return occurrences, nil
}

// GetLatestByRecurringPayment returns the latest occurrence of given payment.
func (r *RepoDB) GetLatestByRecurringPayment(recurringPaymentID int32) (*entity.PaymentOccurrence, error) {
	var occ entity.PaymentOccurrence

	err := r.dbStorage.
		Model(&entity.PaymentOccurrence{}).
		Select("payment_occurrences.*, recurring_payments.name AS recurring_payment_name").
		Joins("JOIN recurring_payments ON recurring_payments.id = payment_occurrences.recurring_payment_id").
		Where("payment_occurrences.recurring_payment_id = ?", recurringPaymentID).
		Order("payment_occurrences.due_date DESC, payment_occurrences.id DESC").
		First(&occ).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, fmt.Errorf(
			"latest occurrence for recurring_payment_id=%d: %w",
			recurringPaymentID, occurrence.ErrNotFound,
		)
	}
	if err != nil {
		return nil, fmt.Errorf(
			"query latest for recurring_payment_id=%d: %w",
			recurringPaymentID, err,
		)
	}
	return &occ, nil
}

// Update updates payment status fields of occurrence.
func (r *RepoDB) Update(occ *entity.PaymentOccurrence) error {
	result := r.dbStorage.
		Model(&entity.PaymentOccurrence{}).
		Where("id = ?", occ.ID).
		Updates(map[string]any{
			"is_paid":      occ.IsPaid,
			"payment_date": occ.PaymentDate,
			"is_notified":  occ.IsNotified,
			"notified_at":  occ.NotifiedAt,
		})

	if result.Error != nil {
		return fmt.Errorf("update by id %d: %w", occ.ID, result.Error)
	}
	if result.RowsAffected == 0 {
		// Either not found or values unchanged. Check existence to
		// distinguish "no-op update" from "not found".
		_, err := r.GetByID(occ.ID)
		if err != nil {
			return fmt.Errorf("update by id %d: %w", occ.ID, err)
		}
		// occurrence exists, values were identical — that's fine.
	}

	return nil
}

// ListToRemind returns occurrences that need a reminder.
func (r *RepoDB) ListToRemind(deadline time.Time) ([]*entity.PaymentOccurrence, error) {
	var occurrences []*entity.PaymentOccurrence

	err := r.dbStorage.
		Model(&entity.PaymentOccurrence{}).
		Select("payment_occurrences.*, recurring_payments.name AS recurring_payment_name").
		Joins("JOIN recurring_payments ON recurring_payments.id = payment_occurrences.recurring_payment_id").
		Where("payment_occurrences.is_paid = ?", false).
		Where("payment_occurrences.is_notified = ?", false).
		Where("recurring_payments.is_deleted = ?", false).
		Where("payment_occurrences.due_date <= ?", deadline.Format("2006-01-02")).
		Order("payment_occurrences.due_date ASC, payment_occurrences.id ASC").
		Find(&occurrences).Error

	if err != nil {
		return nil, fmt.Errorf("list to remind: %w", err)
	}

	return occurrences, nil
}

// MarkNotified sets is_notified=true and notified_at=at.
func (r *RepoDB) MarkNotified(id int32, at time.Time) error {
	result := r.dbStorage.
		Model(&entity.PaymentOccurrence{}).
		Where("id = ?", id).
		Updates(map[string]any{
			"is_notified": true,
			"notified_at": at,
		})

	if result.Error != nil {
		return fmt.Errorf("mark notified by id %d: %w", id, result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("occurrence with id %d: %w", id, occurrence.ErrNotFound)
	}

	return nil
}

// Summary returns total amounts grouped by currency.
func (r *RepoDB) Summary() (map[entity.Currency]decimal.Decimal, error) {
	var rows []struct {
		Currency entity.Currency
		Total    decimal.Decimal
	}

	err := r.dbStorage.
		Model(&entity.PaymentOccurrence{}).
		Select("currency, COALESCE(SUM(amount), 0) AS total").
		Group("currency").
		Scan(&rows).Error

	if err != nil {
		return nil, fmt.Errorf("summary: %w", err)
	}

	result := make(map[entity.Currency]decimal.Decimal, len(rows))
	for _, row := range rows {
		result[row.Currency] = row.Total
	}
	return result, nil
}
