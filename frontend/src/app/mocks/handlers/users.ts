import { delay, http, HttpResponse } from 'msw'

import {
  createMockUser,
  deleteMockUser,
  findUserById,
  isUsernameTaken,
  mockUsers,
  toUserDto,
} from '../db/users'
import {
  badRequest,
  BASE_URL,
  forbidden,
  getSessionUser,
  notFound,
  unauthorized,
} from '../session'

interface IUserBody {
  username?: string
  password?: string
}

const ADMIN_LOCKED_MESSAGE =
  'Учётная запись администратора задаётся в .env и не меняется через панель'

function requireAdmin(cookies: Record<string, string>) {
  const user = getSessionUser(cookies)
  if (!user) {
    return unauthorized()
  }
  return user.isAdmin ? null : forbidden()
}

function conflict() {
  return HttpResponse.json(
    { message: 'Пользователь с таким логином уже есть' },
    { status: 409 },
  )
}

export const usersHandlers = [
  http.get(`${BASE_URL}/users`, async ({ cookies }) => {
    await delay()
    const denied = requireAdmin(cookies)
    if (denied) {
      return denied
    }

    return HttpResponse.json(mockUsers.map(toUserDto))
  }),

  http.post<never, IUserBody>(
    `${BASE_URL}/users`,
    async ({ request, cookies }) => {
      await delay()
      const denied = requireAdmin(cookies)
      if (denied) {
        return denied
      }

      const { username = '', password = '' } = await request.json()
      if (!username.trim() || !password) {
        return badRequest('Укажите логин и пароль')
      }
      if (isUsernameTaken(username)) {
        return conflict()
      }

      const user = createMockUser(username.trim(), password)

      return HttpResponse.json(toUserDto(user), { status: 201 })
    },
  ),

  http.patch<{ id: string }, IUserBody>(
    `${BASE_URL}/users/:id`,
    async ({ params, request, cookies }) => {
      await delay()
      const denied = requireAdmin(cookies)
      if (denied) {
        return denied
      }

      const user = findUserById(params.id)
      if (!user) {
        return notFound('Пользователь не найден')
      }
      if (user.isAdmin) {
        return HttpResponse.json(
          { message: ADMIN_LOCKED_MESSAGE },
          { status: 403 },
        )
      }

      const { username, password } = await request.json()
      if (username !== undefined) {
        if (!username.trim()) {
          return badRequest('Логин не может быть пустым')
        }
        if (isUsernameTaken(username, user.id)) {
          return conflict()
        }
        user.username = username.trim()
      }
      if (password) {
        user.password = password
      }

      return HttpResponse.json(toUserDto(user))
    },
  ),

  http.delete(`${BASE_URL}/users/:id`, async ({ params, cookies }) => {
    await delay()
    const denied = requireAdmin(cookies)
    if (denied) {
      return denied
    }

    const user = findUserById(String(params.id))
    if (!user) {
      return notFound('Пользователь не найден')
    }
    if (user.isAdmin) {
      return HttpResponse.json(
        { message: ADMIN_LOCKED_MESSAGE },
        { status: 403 },
      )
    }

    deleteMockUser(user.id)

    return new HttpResponse(null, { status: 204 })
  }),
]
