package transaction

import (
	"context"

	"gorm.io/gorm"
)

type txKey struct{} // context key for tx value

// TxManager represents a transactions manager for usecases.
type TxManager struct {
	dbStorage *gorm.DB
}

// NewTxManager represents a new instance of TxManager.
func NewTxManager(dbStorage *gorm.DB) *TxManager {
	return &TxManager{
		dbStorage: dbStorage,
	}
}

// WithTransaction takes func to execute it in transaction.
func (tm *TxManager) WithTransaction(fn func(ctx context.Context) error) error {
	return tm.dbStorage.Transaction(func(tx *gorm.DB) error {
		// put tx into context
		ctxWithTx := context.WithValue(context.Background(), txKey{}, tx)
		// exec func
		return fn(ctxWithTx)
	})
}

// DB finds tx in the given context and returns it. If tx was not found it returns default DB.
func DB(ctx context.Context, defaultDB *gorm.DB) *gorm.DB {
	if tx, ok := ctx.Value(txKey{}).(*gorm.DB); ok {
		return tx
	}
	return defaultDB
}
