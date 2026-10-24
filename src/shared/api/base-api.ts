import {
  type BaseQueryFn,
  createApi,
  type FetchArgs,
  fetchBaseQuery,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL
const REFRESH_URL = '/auth/refresh'

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_API_URL,
  credentials: 'include',
})

let refreshPromise: Promise<boolean> | null = null

type TBaseQuery = BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>

async function refreshSession(
  ...[, api, extraOptions]: Parameters<TBaseQuery>
): Promise<boolean> {
  const result = await rawBaseQuery(
    { url: REFRESH_URL, method: 'POST' },
    api,
    extraOptions,
  )
  return !result.error
}

// TODO: onAuthFailure вместо result при 401
const baseQueryWithReauth: TBaseQuery = async (args, api, extraOptions) => {
  if (refreshPromise) {
    await refreshPromise
  }

  const result = await rawBaseQuery(args, api, extraOptions)

  if (result.error?.status !== 401) {
    return result
  }

  refreshPromise ??= refreshSession(args, api, extraOptions).finally(() => {
    refreshPromise = null
  })

  const isRefreshed = await refreshPromise

  return isRefreshed ? rawBaseQuery(args, api, extraOptions) : result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
})
