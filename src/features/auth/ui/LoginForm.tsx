import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import { loginSchema, type TLoginSchema } from '../model/login-schema'
import { useLogin } from '../model/use-login'

const DEFAULT_VALUES = {
  login: '',
  password: '',
} as const

export function LoginForm() {
  const { login } = useLogin()
  const {
    control,
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = useForm<TLoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: DEFAULT_VALUES,
  })

  return (
    <form onSubmit={handleSubmit(login)} noValidate>
      <Controller
        name='login'
        control={control}
        render={({ field, fieldState }) => (
          <>
            <label htmlFor='login'>Логин</label>
            <input
              id='login'
              autoComplete='username'
              aria-invalid={Boolean(fieldState.error)}
              {...field}
            />
            {fieldState.error && <p role='alert'>{fieldState.error.message}</p>}
          </>
        )}
      />
      <Controller
        name='password'
        control={control}
        render={({ field, fieldState }) => (
          <>
            <label htmlFor='password'>Пароль</label>
            <input
              id='password'
              type='password'
              autoComplete='current-password'
              aria-invalid={Boolean(fieldState.error)}
              {...field}
            />
            {fieldState.error && <p role='alert'>{fieldState.error.message}</p>}
          </>
        )}
      />

      <button type='submit' disabled={!isDirty || isSubmitting}>
        Войти
      </button>
    </form>
  )
}
