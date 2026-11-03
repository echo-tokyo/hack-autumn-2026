package repo

import (
	"context"
	"errors"
	"fmt"

	"gorm.io/gorm"

	"backend/internal/app/entity"
	occurrence "backend/internal/app/payment_occurrence"
	"backend/internal/pkg/db"
	"backend/internal/pkg/db/transaction"
)

// Ensure DB implements interface.
var _ occurrence.RepositoryDB = (*DB)(nil)

// DB is a payment occurrence DB repo.
// It implements the [RepositoryDB] interface.
type DB struct {
	dbStorage *db.DB
}

// NewDB returns a new instance of [DB].
func NewDB(dbStorage *db.DB) *DB {
	return &DB{
		dbStorage: dbStorage,
	}
}

// Create creates a new payment occurrence.
// Returns ErrAlreadyExists if occurrence already exists.
func (r *DB) Create(ctx context.Context, occ *entity.PaymentOccurrence) error {
	tx := transaction.DB(ctx, r.dbStorage.DB)

	err := tx.Create(occ).Error
	if errors.Is(err, gorm.ErrDuplicatedKey) {
		return fmt.Errorf(
			"occurrence for recurring_payment_id=%d due_date=%s: %w",
			occ.RecurringPaymentID,
			occ.DueDateFmt(),
			occurrence.ErrAlreadyExists,
		)
	}
	return err // err OR nil
}

// GetByID returns payment occurrence by given id.
// Returns ErrNotFound if occurrence does not exist.
func (r *DB) GetByID(ctx context.Context, id int32) (*entity.PaymentOccurrence, error) {
	tx := transaction.DB(ctx, r.dbStorage.DB)
	occ := &entity.PaymentOccurrence{}

	err := tx.
		Select("payment_occurrences.*, recurring_payments.name AS recurring_payment_name").
		Joins("JOIN recurring_payments ON recurring_payments.id = payment_occurrences.recurring_payment_id"). //nolint:lll // join cond
		Where("payment_occurrences.id = ?", id).
		First(occ).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, fmt.Errorf("occurrence with id %d: %w", id, occurrence.ErrNotFound)
	}
	return occ, err // err OR nil
}

// GetLatestByPayment returns the latest (by due_date) occurrence of given payment.
// Returns ErrNotFound if there are no occurrences yet.
func (r *DB) GetLatestByPayment(ctx context.Context,
	paymentID int32) (*entity.PaymentOccurrence, error) {

	tx := transaction.DB(ctx, r.dbStorage.DB)
	occ := &entity.PaymentOccurrence{}

	err := tx.
		Select("payment_occurrences.*, recurring_payments.name AS recurring_payment_name").
		Joins("JOIN recurring_payments ON recurring_payments.id = payment_occurrences.recurring_payment_id"). //nolint:lll // join cond
		Where("payment_occurrences.recurring_payment_id = ?", paymentID).
		Order("payment_occurrences.due_date DESC, payment_occurrences.id DESC").
		First(occ).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, fmt.Errorf(
			"latest occurrence for recurring_payment_id=%d: %w",
			paymentID, occurrence.ErrNotFound,
		)
	}
	return occ, err // err OR nil
}

// Update updates payment status fields of occurrence.
// Returns ErrNotFound if occurrence does not exist.
func (r *DB) Update(ctx context.Context, data *entity.PaymentOccurrence) error {
	tx := transaction.DB(ctx, r.dbStorage.DB)

	err := tx.Model(&entity.PaymentOccurrence{}).
		Where("id = ?", data.ID).
		Save(data).Error
	if err != nil {
		return fmt.Errorf("update by id %d: %w", data.ID, err)
	}
	return nil
}

// List returns payment occurrences matching filter.
func (r *DB) List(ctx context.Context,
	filter *entity.OccListFilter) ([]*entity.PaymentOccurrence, error) {

	tx := transaction.DB(ctx, r.dbStorage.DB)
	var occurrences []*entity.PaymentOccurrence

	query := tx.Model(&entity.PaymentOccurrence{}).
		Select("payment_occurrences.*, recurring_payments.name AS recurring_payment_name").
		Joins("JOIN recurring_payments ON recurring_payments.id = payment_occurrences.recurring_payment_id") //nolint:lll // join cond

	if filter.RecurringPaymentID != nil {
		query = query.Where("payment_occurrences.recurring_payment_id = ?", *filter.RecurringPaymentID)
	}
	if filter.Currency != nil {
		query = query.Where("payment_occurrences.currency = ?", *filter.Currency)
	}
	if filter.Status != nil {
		switch *filter.Status {
		case entity.StatusPaid:
			query = query.Where("payment_occurrences.is_paid = ?", true)
		case entity.StatusUnpaid:
			query = query.Where(
				"payment_occurrences.is_paid = ? AND payment_occurrences.due_date >= ?",
				false, filter.Today,
			)
		case entity.StatusOverdue:
			query = query.Where(
				"payment_occurrences.is_paid = ? AND payment_occurrences.due_date < ?",
				false, filter.Today,
			)
		}
	}
	err := query.Order("payment_occurrences.due_date ASC, payment_occurrences.id ASC").
		Find(&occurrences).Error
	return occurrences, err // err OR nil
}

// Summary returns total amounts grouped by currency.
func (r *DB) Summary(ctx context.Context, todayDate string) ([]entity.OccSummary, error) {
	tx := transaction.DB(ctx, r.dbStorage.DB)
	var result []entity.OccSummary

	err := tx.Model(&entity.PaymentOccurrence{}).
		Select(`
			payment_occurrences.currency AS currency,
			COALESCE(SUM(CASE
				WHEN payment_occurrences.is_paid = false
				 AND payment_occurrences.due_date >= ?
				THEN payment_occurrences.amount ELSE 0 END), 0) AS to_pay,
			COALESCE(SUM(CASE
				WHEN payment_occurrences.is_paid = false
				 AND payment_occurrences.due_date <  ?
				THEN payment_occurrences.amount ELSE 0 END), 0) AS overdue,
			COALESCE(SUM(CASE
				WHEN payment_occurrences.is_paid = true
				THEN payment_occurrences.amount ELSE 0 END), 0) AS paid
		`, todayDate, todayDate).
		Joins("JOIN recurring_payments ON recurring_payments.id = payment_occurrences.recurring_payment_id"). //nolint:lll // join cond
		Where("recurring_payments.is_deleted = ?", false).
		Group("payment_occurrences.currency").
		Scan(&result).Error

	if err != nil {
		return nil, fmt.Errorf("summary: %w", err)
	}
	return result, nil
}
