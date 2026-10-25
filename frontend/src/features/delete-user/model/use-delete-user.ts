import { type IUser, useDeleteUserMutation } from '@/entities/user'
import { runWithToast } from '@/shared/api'

export function useDeleteUser(user: IUser) {
  const [deleteMutation, { isLoading }] = useDeleteUserMutation()

  function remove() {
    return runWithToast(() => deleteMutation(user.id).unwrap(), {
      successMessage: `Пользователь ${user.username} удалён`,
    })
  }

  return { remove, isLoading }
}
