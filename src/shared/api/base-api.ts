import {
  type BaseQueryFn,
  createApi,
  type FetchArgs,
  fetchBaseQuery,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL
const REFRESH_URL = '/auth/refresh'
const REFETCH_AFTER_SECONDS = 30

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_API_URL,
  credentials: 'include',
})

const SESSION_LOST_STATUSES = new Set<FetchBaseQueryError['status']>([401, 403])

let refreshPromise: Promise<FetchBaseQueryError | undefined> | null = null

export interface IBaseQueryExtraOptions {
  skipReauth?: boolean
  isSessionCheck?: boolean
}

type TBaseQuery = BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  IBaseQueryExtraOptions
>

async function refreshSession(
  ...[, api, extraOptions]: Parameters<TBaseQuery>
): Promise<FetchBaseQueryError | undefined> {
  const { error } = await rawBaseQuery(
    { url: REFRESH_URL, method: 'POST' },
    api,
    extraOptions,
  )
  return error
}

const baseQueryWithReauth: TBaseQuery = async (
  args,
  api,
  extraOptions = {},
) => {
  if (refreshPromise) {
    await refreshPromise
  }

  const result = await rawBaseQuery(args, api, extraOptions)

  if (result.error?.status !== 401 || extraOptions.skipReauth) {
    return result
  }

  refreshPromise ??= refreshSession(args, api, extraOptions).finally(() => {
    refreshPromise = null
  })

  const refreshError = await refreshPromise

  if (!refreshError) {
    return rawBaseQuery(args, api, extraOptions)
  }

  if (
    SESSION_LOST_STATUSES.has(refreshError.status) &&
    !extraOptions.isSessionCheck
  ) {
    api.dispatch(baseApi.util.resetApiState())
  }

  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: REFETCH_AFTER_SECONDS,
  tagTypes: [
    'Session',
    'PaymentOccurrence',
    'PaymentsSummary',
    'RecurringPayment',
    'User',
  ],
  endpoints: () => ({}),
})
