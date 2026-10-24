import { baseApi } from '@/shared/api'

import type { ILoginRequest, IUser } from '../model/types'

export const userApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMe: build.query<IUser, void>({
      query: () => '/auth/me',
      providesTags: ['Session'],
      extraOptions: { isSessionCheck: true },
    }),
    login: build.mutation<void, ILoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      invalidatesTags: ['Session'],
      extraOptions: { skipReauth: true },
    }),

    logout: build.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
  }),
})

export const { useGetMeQuery, useLoginMutation, useLogoutMutation } = userApi
