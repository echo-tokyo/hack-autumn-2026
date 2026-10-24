import { useLocation, useNavigate } from 'react-router'
import { toast } from 'sonner'

import { getErrorMessage } from '@/shared/api'
import { ROUTES } from '@/shared/config'

import { useLoginMutation } from '../api/auth-api'
import type { ILoginRequest } from './types'

const LOGIN_ERROR_MESSAGES = { 401: 'Неверный логин или пароль' }

function getRedirectPath(state: unknown): string {
  if (
    typeof state === 'object' &&
    state !== null &&
    'from' in state &&
    typeof state.from === 'string'
  ) {
    return state.from
  }
  return ROUTES.payments
}

export function useLogin() {
  const [loginMutation] = useLoginMutation()
  const navigate = useNavigate()
  const location = useLocation()

  async function login(values: ILoginRequest) {
    try {
      await loginMutation(values).unwrap()
      await navigate(getRedirectPath(location.state), { replace: true })
    } catch (error) {
      toast.error(getErrorMessage(error, LOGIN_ERROR_MESSAGES))
    }
  }

  return { login }
}
