package time

import "time"

// ComputeNextDueDate returns the next due date after 'from' for a payment
// that bills on 'billingDay' each month.
func ComputeNextDueDate(billingDay int, from time.Time) time.Time {
	if billingDay < 1 {
		billingDay = 1
	}
	if billingDay > 31 {
		billingDay = 31
	}

	year, month, _ := from.Date()

	nextMonth := month + 1
	nextYear := year
	if nextMonth > 12 {
		nextMonth = 1
		nextYear++
	}

	// Last day of the target month.
	lastDay := time.Date(nextYear, nextMonth+1, 0, 0, 0, 0, 0, time.UTC).Day()

	actualDay := min(billingDay, lastDay)

	return time.Date(nextYear, nextMonth, actualDay, 0, 0, 0, 0, time.UTC)
}
