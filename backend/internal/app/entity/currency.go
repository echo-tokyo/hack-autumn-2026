package entity

type Currency string

const (
	CurrencyRUB Currency = "RUB"
	CurrencyUSD Currency = "USD"
	CurrencyEUR Currency = "EUR"
)

// Valid reports whether currency is one of supported values.
func (s Currency) Valid() bool {
	switch s {
	case CurrencyRUB, CurrencyUSD, CurrencyEUR:
		return true
	}
	return false
}
