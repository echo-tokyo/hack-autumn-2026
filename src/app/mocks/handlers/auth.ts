import { delay, http, HttpResponse } from 'msw'

import { findUserById, mockUsers, toUserDto } from '../db/users'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

const ACCESS_COOKIE = 'access_token'
const REFRESH_COOKIE = 'refresh_token'
const ACCESS_TTL_MS = 60 * 1000

interface ILoginBody {
  login: string
  password: string
}

function accessCookie(userId: number) {
  return `${ACCESS_COOKIE}=${userId}.${Date.now() + ACCESS_TTL_MS}; Path=/`
}

function refreshCookie(userId: number) {
  return `${REFRESH_COOKIE}=${userId}; Path=/`
}

function getUserIdFromAccess(token: string | undefined) {
  const [userId, expiresAt] = token?.split('.') ?? []
  return Number(expiresAt) > Date.now() ? userId : undefined
}

function unauthorized() {
  return HttpResponse.json({ message: 'Требуется вход' }, { status: 401 })
}

export const authHandlers = [
  http.post<never, ILoginBody>(
    `${BASE_URL}/auth/login`,
    async ({ request }) => {
      await delay()
      const { login, password } = await request.json()
      const user = mockUsers.find(
        (item) => item.login === login && item.password === password,
      )

      if (!user) {
        return HttpResponse.json(
          { message: 'Неверный логин или пароль' },
          { status: 401 },
        )
      }

      const headers = new Headers()
      headers.append('Set-Cookie', accessCookie(user.id))
      headers.append('Set-Cookie', refreshCookie(user.id))

      return HttpResponse.json(toUserDto(user), { headers })
    },
  ),

  http.get(`${BASE_URL}/auth/me`, async ({ cookies }) => {
    await delay()
    const user = findUserById(getUserIdFromAccess(cookies[ACCESS_COOKIE]))

    return user ? HttpResponse.json(toUserDto(user)) : unauthorized()
  }),

  http.post(`${BASE_URL}/auth/refresh`, async ({ cookies }) => {
    await delay()
    const user = findUserById(cookies[REFRESH_COOKIE])

    if (!user) {
      return unauthorized()
    }

    return new HttpResponse(null, {
      status: 204,
      headers: { 'Set-Cookie': accessCookie(user.id) },
    })
  }),

  http.post(`${BASE_URL}/auth/logout`, async () => {
    await delay()
    const headers = new Headers()
    headers.append('Set-Cookie', `${ACCESS_COOKIE}=; Path=/; Max-Age=0`)
    headers.append('Set-Cookie', `${REFRESH_COOKIE}=; Path=/; Max-Age=0`)

    return new HttpResponse(null, { status: 204, headers })
  }),
]
