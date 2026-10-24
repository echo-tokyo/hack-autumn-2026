import { baseApi } from '@/shared/api'

import type { ILoginRequest } from '../model/types'

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<void, ILoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      invalidatesTags: ['Session'],
      extraOptions: { skipReauth: true },
    }),
  }),
})

export const { useLoginMutation } = authApi
