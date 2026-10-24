import { baseApi } from '@/shared/api'

import type { IUser } from '../model/types'

export const userApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMe: build.query<IUser, void>({
      query: () => '/auth/me',
      providesTags: ['Session'],
      extraOptions: { isSessionCheck: true },
    }),
  }),
})

export const { useGetMeQuery } = userApi
