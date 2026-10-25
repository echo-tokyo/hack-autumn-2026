import { useGetMeQuery } from '../api/user-api'
import type { IUser } from './types'

export function useCurrentUser(): IUser {
  const { data } = useGetMeQuery()

  if (!data) {
    throw new Error('useCurrentUser is used outside of ProtectedRoute')
  }

  return data
}
