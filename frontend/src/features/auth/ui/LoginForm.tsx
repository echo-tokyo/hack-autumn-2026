import { zodResolver } from '@hookform/resolvers/zod'
import { Button, PasswordInput, Stack, TextInput } from '@mantine/core'
import { Controller, useForm } from 'react-hook-form'

import { loginSchema, type TLoginSchema } from '../model/login-schema'
import { useLogin } from '../model/use-login'

const DEFAULT_VALUES = {
  username: '',
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
      <Stack gap='xs'>
        <Controller
          name='username'
          control={control}
          render={({ field, fieldState }) => (
            <TextInput
              label='Логин'
              withAsterisk
              placeholder='Введите логин'
              autoComplete='username'
              error={fieldState.error?.message}
              {...field}
            />
          )}
        />
        <Controller
          name='password'
          control={control}
          render={({ field, fieldState }) => (
            <PasswordInput
              label='Пароль'
              withAsterisk
              placeholder='Введите пароль'
              autoComplete='current-password'
              error={fieldState.error?.message}
              {...field}
            />
          )}
        />
        <Button
          type='submit'
          fullWidth
          disabled={!isDirty}
          loading={isSubmitting}
        >
          войти
        </Button>
      </Stack>
    </form>
  )
}
