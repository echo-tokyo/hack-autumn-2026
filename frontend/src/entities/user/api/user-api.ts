import { baseApi } from '@/shared/api'

import type {
  ICreateUser,
  ILoginRequest,
  IUpdateUser,
  IUser,
} from '../model/types'

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

    getUsers: build.query<IUser[], void>({
      query: () => '/users',
      providesTags: ['User'],
    }),

    createUser: build.mutation<IUser, ICreateUser>({
      query: (body) => ({ url: '/users', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),

    updateUser: build.mutation<IUser, IUpdateUser>({
      query: ({ id, ...body }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    deleteUser: build.mutation<void, number>({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['User'],
    }),
  }),
})

export const {
  useGetMeQuery,
  useLoginMutation,
  useLogoutMutation,
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi
