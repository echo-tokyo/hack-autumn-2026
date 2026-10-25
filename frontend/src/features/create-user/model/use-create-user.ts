import { type ICreateUser, useCreateUserMutation } from '@/entities/user'
import { runWithToast } from '@/shared/api'

export function useCreateUser() {
  const [createMutation] = useCreateUserMutation()

  function create(values: ICreateUser) {
    return runWithToast(() => createMutation(values).unwrap(), {
      successMessage: `Пользователь ${values.username} создан`,
    })
  }

  return { create }
}
