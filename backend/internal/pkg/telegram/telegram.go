// Package telegram is a thin wrapper around the Telegram Bot API.
package telegram

import (
	"context"
	"fmt"
	"net/http"
	"time"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
)

// Client sends messages to a single configured chat.
type Client struct {
	bot    *tgbotapi.BotAPI
	chatID int64
}

// New returns a new [Client]. It verifies the bot token via getMe on startup.
func New(token string, chatID int64) (*Client, error) {
	if token == "" {
		return nil, fmt.Errorf("telegram: bot token is empty")
	}
	if chatID == 0 {
		return nil, fmt.Errorf("telegram: chat id is empty")
	}

	bot, err := tgbotapi.NewBotAPI(token)
	if err != nil {
		return nil, fmt.Errorf("telegram: init bot: %w", err)
	}
	bot.Client = &http.Client{Timeout: 15 * time.Second}

	return &Client{bot: bot, chatID: chatID}, nil
}

// SendMessage sends text (HTML parse mode) to the configured chat.
func (c *Client) SendMessage(ctx context.Context, text string) error {
	if err := ctx.Err(); err != nil {
		return err
	}

	msg := tgbotapi.NewMessage(c.chatID, text)
	msg.ParseMode = tgbotapi.ModeHTML
	msg.DisableWebPagePreview = true

	if _, err := c.bot.Send(msg); err != nil {
		return fmt.Errorf("telegram: send message: %w", err)
	}
	return nil
}
