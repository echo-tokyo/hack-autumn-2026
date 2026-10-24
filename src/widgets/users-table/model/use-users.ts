import { useGetUsersQuery } from '@/entities/user'
import { useErrorToast } from '@/shared/api'

export function useUsers() {
  const { data, error, isLoading } = useGetUsersQuery()

  useErrorToast(error)

  const users = error ? [] : (data ?? [])

  return { users, isLoading }
}
