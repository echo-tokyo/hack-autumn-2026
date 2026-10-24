package db

import "database/sql"

func NullInt64[T int | int8 | int16 | int32 | int64](n T) sql.NullInt64 {
	return sql.NullInt64{
		Int64: int64(n),
		Valid: n != 0,
	}
}

func NullString(s string) sql.NullString {
	return sql.NullString{
		String: s,
		Valid:  s != "",
	}
}
