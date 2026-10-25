import { type IUpdateUser, useUpdateUserMutation } from '@/entities/user'
import { runWithToast } from '@/shared/api'

const UPDATE_ERROR_MESSAGES = {
  409: 'Пользователь с таким логином уже есть',
}

export function useEditUser() {
  const [updateMutation] = useUpdateUserMutation()

  function update(values: IUpdateUser) {
    return runWithToast(() => updateMutation(values).unwrap(), {
      successMessage: 'Изменения сохранены',
      errorMessages: UPDATE_ERROR_MESSAGES,
    })
  }

  return { update }
}
