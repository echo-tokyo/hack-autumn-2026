import { z } from 'zod'

const USERNAME_MIN = 3
const USERNAME_MAX = 50
const PASSWORD_MIN = 6

export const usernameField = z
  .string()
  .trim()
  .min(USERNAME_MIN, `Логин не короче ${USERNAME_MIN} символов`)
  .max(USERNAME_MAX, `Логин не длиннее ${USERNAME_MAX} символов`)
  .regex(/^[a-zA-Z0-9_.-]+$/, 'Только латиница, цифры, точка, _ и -')

const PASSWORD_MESSAGE = `Пароль не короче ${PASSWORD_MIN} символов`

export const passwordField = z.string().min(PASSWORD_MIN, PASSWORD_MESSAGE)

export const optionalPasswordField = z
  .string()
  .refine(
    (value) => value === '' || value.length >= PASSWORD_MIN,
    PASSWORD_MESSAGE,
  )
