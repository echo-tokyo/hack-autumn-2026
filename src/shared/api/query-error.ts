import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'

const DEFAULT_ERROR_MESSAGE = 'Не удалось выполнить запрос. Попробуйте ещё раз'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return isObject(error) && 'status' in error
}

function isSerializedError(error: unknown): error is SerializedError {
  return isObject(error) && typeof error.message === 'string'
}

type TStatusMessages = Partial<Record<number, string>>

export function getErrorMessage(
  error: unknown,
  statusMessages: TStatusMessages = {},
): string {
  if (isFetchBaseQueryError(error)) {
    if (typeof error.status === 'number' && statusMessages[error.status]) {
      return statusMessages[error.status] ?? DEFAULT_ERROR_MESSAGE
    }
    if (error.status === 'FETCH_ERROR') {
      return 'Сервер недоступен. Проверьте подключение и попробуйте ещё раз'
    }
    if (isObject(error.data) && typeof error.data.message === 'string') {
      return error.data.message
    }
    return DEFAULT_ERROR_MESSAGE
  }

  if (isSerializedError(error)) {
    return error.message ?? DEFAULT_ERROR_MESSAGE
  }

  return DEFAULT_ERROR_MESSAGE
}
