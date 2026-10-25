import { delay, http, HttpResponse } from 'msw'

import { findUserById, mockUsers, toUserDto } from '../db/users'
import {
  ACCESS_COOKIE,
  accessCookie,
  BASE_URL,
  getSessionUser,
  REFRESH_COOKIE,
  refreshCookie,
  unauthorized,
} from '../session'

interface ILoginBody {
  username: string
  password: string
}

export const authHandlers = [
  http.post<never, ILoginBody>(
    `${BASE_URL}/auth/login`,
    async ({ request }) => {
      await delay()
      const { username, password } = await request.json()
      const user = mockUsers.find(
        (item) => item.username === username && item.password === password,
      )

      if (!user) {
        return HttpResponse.json(
          { message: 'Неверный логин или пароль' },
          { status: 400 },
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
    const user = getSessionUser(cookies)

    return user ? HttpResponse.json(toUserDto(user)) : unauthorized()
  }),

  http.post(`${BASE_URL}/auth/obtain`, async ({ cookies }) => {
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
