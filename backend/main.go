// App binary starts full application.
package main

import (
	"log/slog"
	"os"

	"backend/internal/app"
)

func main() {
	var (
		err         error
		application *app.App
	)

	application, err = app.NewApp()
	if err != nil {
		fatal(err)
	}
	if err := application.Run(); err != nil {
		fatal(err)
	}
}

// fatal logs error and exit with code 1.
func fatal(err error) {
	slog.Error(err.Error())
	os.Exit(1)
}
