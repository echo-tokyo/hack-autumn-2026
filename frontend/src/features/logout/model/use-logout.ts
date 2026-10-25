import { useDispatch } from 'react-redux'
import { toast } from 'sonner'

import { useLogoutMutation } from '@/entities/user'
import { baseApi, getErrorMessage } from '@/shared/api'

export function useLogout() {
  const [logoutMutation, { isLoading }] = useLogoutMutation()
  const dispatch = useDispatch()

  async function logout() {
    try {
      await logoutMutation().unwrap()
      dispatch(baseApi.util.resetApiState())
      toast.info('Выход из аккаунта')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return { logout, isLoading }
}
