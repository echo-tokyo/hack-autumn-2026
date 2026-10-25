import { HttpResponse } from 'msw'

import { findUserById, type IMockUser } from './db/users'

export const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const ACCESS_COOKIE = 'access_token'
export const REFRESH_COOKIE = 'refresh_token'
const ACCESS_TTL_MS = 60 * 1000

export function accessCookie(userId: number) {
  return `${ACCESS_COOKIE}=${userId}.${Date.now() + ACCESS_TTL_MS}; Path=/`
}

export function refreshCookie(userId: number) {
  return `${REFRESH_COOKIE}=${userId}; Path=/`
}

export function getSessionUser(
  cookies: Record<string, string>,
): IMockUser | undefined {
  const [userId, expiresAt] = cookies[ACCESS_COOKIE]?.split('.') ?? []
  return Number(expiresAt) > Date.now() ? findUserById(userId) : undefined
}

export function unauthorized() {
  return HttpResponse.json({ message: 'Требуется вход' }, { status: 401 })
}

export function forbidden() {
  return HttpResponse.json(
    { message: 'Действие доступно только администратору' },
    { status: 403 },
  )
}

export function notFound(message: string) {
  return HttpResponse.json({ message }, { status: 404 })
}

export function badRequest(message: string) {
  return HttpResponse.json({ message }, { status: 400 })
}
