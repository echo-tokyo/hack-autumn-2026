package time

import (
	"math"
	"time"
)

const (
	_hoursInDay   = 24
	_daysInMonth  = 31
	_monthsInYear = 12

	_dateFmt = "2006-01-02"
)

// ComputeNextDeadline returns the next deadline date after 'from'
// that happens on 'deadlineDay' each month.
func ComputeNextDeadline(deadlineDay int, from time.Time) time.Time {
	if deadlineDay < 1 {
		deadlineDay = 1
	}
	if deadlineDay > _daysInMonth {
		deadlineDay = _daysInMonth
	}

	year, month, _ := from.Date()

	nextMonth := month + 1
	nextYear := year
	if nextMonth > _monthsInYear {
		nextMonth = 1
		nextYear++
	}

	// Last day of the target month.
	lastDay := time.Date(nextYear, nextMonth+1, 0, 0, 0, 0, 0, time.UTC).Day()
	actualDay := min(deadlineDay, lastDay)

	return time.Date(nextYear, nextMonth, actualDay, 0, 0, 0, 0, time.UTC)
}

// DateOnly returns date-only time in UTC.
func DateOnly(t time.Time) time.Time {
	return time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, time.UTC)
}

// today returns current date (date only) in configured timezone normalized to UTC.
func Today(timezone *time.Location) time.Time {
	now := time.Now().In(timezone)
	return DateOnly(now)
}

// FormatDate formats time.Time to date string.
func FormatDate(t time.Time) string {
	return t.Format(_dateFmt)
}

// DaysBetween returns days amount between given dates.
func DaysBetween(t1, t2 time.Time) int32 {
	return int32(math.Abs(t1.Sub(t2).Hours()) / _hoursInDay)
}
