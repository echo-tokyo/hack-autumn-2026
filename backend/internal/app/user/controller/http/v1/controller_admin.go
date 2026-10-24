package v1

import (
	"errors"
	"fmt"

	fiber "github.com/gofiber/fiber/v2"

	"backend/internal/app/user"
	"backend/internal/pkg/serialize"
	"backend/internal/pkg/validator"
)

// UserControllerAdmin represents a controller for user routes accepted for admin only.
type UserControllerAdmin struct {
	valid       validator.Validator
	userUCAdmin user.UsecaseAdmin
}

// NewControllerAdmin returns a new instance of [UserControllerAdmin].
func NewControllerAdmin(userUCAdmin user.UsecaseAdmin,
	valid validator.Validator) *UserControllerAdmin {

	return &UserControllerAdmin{
		valid:       valid,
		userUCAdmin: userUCAdmin,
	}
}

// @summary		Создание нового юзера. [Только админ]
// @description	Создание нового юзера и профиля для него со всеми данными.
// @router			/users [post]
// @id				users-create
// @tags			users
// @accept			json
// @produce		json
// @security		JWTAccess
// @param			userBody	body		userBody	true	"userBody"
// @success		201			{object}	entity.User
// @failure		400			"слабый пароль"
// @failure		401			"неверный токен (пустой, истекший или неверный формат)"
// @failure		409			"пользователь с введенным логином уже существует"
func (c *UserControllerAdmin) Create(ctx *fiber.Ctx) error {
	inputBody := &userBody{}
	if err := serialize.Deserialize(inputBody, ctx.BodyParser, c.valid.Validate); err != nil {
		return err
	}
	userObj := inputBody.ToEntityUser()

	// create a new user
	err := c.userUCAdmin.Create(userObj)
	if errors.Is(err, user.ErrAlreadyExists) {
		return fiber.NewError(fiber.StatusConflict,
			"пользователь с введенным логином уже существует")
	}
	if err != nil {
		return err
	}
	return ctx.Status(fiber.StatusCreated).JSON(userObj)
}

// @summary		Получение юзера по id. [Только админ]
// @description	Получение юзера со всеми данными по его id.
// @router			/users/{id} [get]
// @id				users-read
// @tags			users
// @accept			json
// @produce		json
// @security		JWTAccess
// @param			id	path		int	true	"ID юзера"
// @success		200	{object}	entity.User
// @failure		401	"неверный токен (пустой, истекший или неверный формат)"
// @failure		404	"пользователь не найден"
func (c *UserControllerAdmin) Read(ctx *fiber.Ctx) error {
	inputPath := &userIDPath{}
	if err := serialize.Deserialize(inputPath, ctx.ParamsParser, c.valid.Validate); err != nil {
		return err
	}

	userResp, err := c.userUCAdmin.GetByID(inputPath.ID)
	if errors.Is(err, user.ErrNotFound) {
		return fiber.NewError(fiber.StatusNotFound,
			"пользователь не найден")
	}
	if err != nil {
		return fmt.Errorf("read: %w", err)
	}
	return ctx.Status(fiber.StatusOK).JSON(userResp)
}

// @summary		Обновление юзера по id. [Только админ]
// @description	Полное обновление профиля юзера, его группы (если студент) и пароля (опционально) по его id.
// @router			/users/{id} [patch]
// @id				users-update
// @tags			users
// @accept			json
// @produce		json
// @security		JWTAccess
// @param			id			path		int			true	"ID юзера"
// @param			updateBody	body		updateBody	true	"updateBody"
// @success		200			{object}	entity.User
// @failure		400			"слабый пароль"
// @failure		401			"неверный токен (пустой, истекший или неверный формат)"
// @failure		404			"пользователь не найден"
func (c *UserControllerAdmin) Update(ctx *fiber.Ctx) error {
	inputPath := &userIDPath{}
	if err := serialize.Deserialize(inputPath, ctx.ParamsParser, c.valid.Validate); err != nil {
		return err
	}
	inputBody := &updateBody{}
	if err := serialize.Deserialize(inputBody, ctx.BodyParser, c.valid.Validate); err != nil {
		return err
	}
	updateData := inputBody.ToEntityUser()

	// update user
	newUser, err := c.userUCAdmin.Update(inputPath.ID, updateData)
	if errors.Is(err, user.ErrNotFound) {
		return fiber.NewError(fiber.StatusNotFound,
			"пользователь не найден")
	}
	if err != nil {
		return fmt.Errorf("update: %w", err)
	}
	return ctx.Status(fiber.StatusOK).JSON(newUser)
}

// @summary		Удаление юзера по id. [Только админ]
// @description	Удаление юзера по его id.
// @router			/users/{id} [delete]
// @id				users-delete
// @tags			users
// @accept			json
// @produce		json
// @security		JWTAccess
// @param			id	path	int	true	"ID юзера"
// @success		204	"No Content"
// @failure		401	"неверный токен (пустой, истекший или неверный формат)"
// @failure		404	"пользователь не найден"
func (c *UserControllerAdmin) Delete(ctx *fiber.Ctx) error {
	inputPath := &userIDPath{}
	if err := serialize.Deserialize(inputPath, ctx.ParamsParser, c.valid.Validate); err != nil {
		return err
	}

	err := c.userUCAdmin.DeleteByID(inputPath.ID)
	if errors.Is(err, user.ErrNotFound) {
		return fiber.NewError(fiber.StatusNotFound,
			"пользователь не найден")
	}
	if err != nil {
		return fmt.Errorf("delete: %w", err)
	}
	return ctx.Status(fiber.StatusNoContent).JSON(nil)
}

// @summary		Получение списка юзеров. [Только админ]
// @description	Получение списка юзеров со всеми данными.
// @router			/users [get]
// @id				users-list
// @tags			users
// @accept			json
// @produce		json
// @security		JWTAccess
// @success		200	{array}	entity.User
// @failure		401	"неверный токен (пустой, истекший или неверный формат)"
func (c *UserControllerAdmin) List(ctx *fiber.Ctx) error {
	// get users
	userListResp, err := c.userUCAdmin.GetAll()
	if err != nil {
		return fmt.Errorf("list: %w", err)
	}
	return ctx.Status(fiber.StatusOK).JSON(userListResp)
}
