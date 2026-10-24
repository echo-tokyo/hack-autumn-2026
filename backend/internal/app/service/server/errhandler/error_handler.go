// Package errhandler contains custom error handler func for fiber server.
package errhandler

import (
	goerrors "errors"
	"log/slog"

	fiber "github.com/gofiber/fiber/v2"

	"backend/internal/pkg/validator"
)

// CustomErrorHandler is a custom error handler for server.
func CustomErrorHandler(ctx *fiber.Ctx, err error) error {
	var (
		errCode int
		errMsg  string
		errLog  bool

		fiberErr *fiber.Error
	)

	switch {
	// *fiber.Error error
	case goerrors.As(err, &fiberErr):
		errCode = fiberErr.Code
		switch fiberErr.Code {
		case fiber.StatusNotFound:
			errMsg = "запись не найдена"
			errLog = false
		case fiber.StatusForbidden:
			errMsg = "запрещено"
			errLog = true
		default:
			errMsg = fiberErr.Message
			errLog = true
		}
	// validate error
	case goerrors.Is(err, validator.ErrValidate):
		errCode = fiber.StatusBadRequest
		errMsg = err.Error()
		errLog = false
	// unknown error
	default:
		errCode = fiber.StatusInternalServerError
		errMsg = "внутренняя ошибка сервера"
		errLog = true
	}

	if errLog {
		slog.Error("error handler",
			"code", errCode,
			"cause", err)
	}
	// send error response
	return ctx.Status(errCode).JSON(map[string]string{
		"message": errMsg,
	})
}
