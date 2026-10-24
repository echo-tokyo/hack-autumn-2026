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

export const passwordField = z
  .string()
  .min(PASSWORD_MIN, `Пароль не короче ${PASSWORD_MIN} символов`)
