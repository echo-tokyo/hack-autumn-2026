import { z } from 'zod'

const USERNAME_MIN = 3
const USERNAME_MAX = 50
const PASSWORD_MIN = 8
const PASSWORD_MAX = 40

export const usernameField = z
  .string()
  .trim()
  .min(USERNAME_MIN, `Логин не короче ${USERNAME_MIN} символов`)
  .max(USERNAME_MAX, `Логин не длиннее ${USERNAME_MAX} символов`)
  .regex(/^[a-zA-Z0-9_.-]+$/, 'Только латиница, цифры, точка, _ и -')

const PASSWORD_MESSAGE = `Пароль от ${PASSWORD_MIN} до ${PASSWORD_MAX} символов`

export const passwordField = z
  .string()
  .min(PASSWORD_MIN, PASSWORD_MESSAGE)
  .max(PASSWORD_MAX, PASSWORD_MESSAGE)

export const optionalPasswordField = z
  .string()
  .refine(
    (value) => value === '' || passwordField.safeParse(value).success,
    PASSWORD_MESSAGE,
  )
