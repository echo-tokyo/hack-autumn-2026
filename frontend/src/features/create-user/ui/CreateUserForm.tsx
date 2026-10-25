import { zodResolver } from '@hookform/resolvers/zod'
import { Button, PasswordInput, Stack, Text, TextInput } from '@mantine/core'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { passwordField, usernameField } from '@/entities/user'

import { useCreateUser } from '../model/use-create-user'

const createUserSchema = z.object({
  username: usernameField,
  password: passwordField,
})

type TCreateUserSchema = z.infer<typeof createUserSchema>

const DEFAULT_VALUES: TCreateUserSchema = { username: '', password: '' }

interface ICreateUserFormProps {
  onDone: () => void
}

export function CreateUserForm({ onDone }: ICreateUserFormProps) {
  const { create } = useCreateUser()
  const {
    control,
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = useForm<TCreateUserSchema>({
    resolver: zodResolver(createUserSchema),
    defaultValues: DEFAULT_VALUES,
  })

  async function onSubmit(values: TCreateUserSchema) {
    if (await create(values)) {
      onDone()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack gap='md'>
        <Controller
          name='username'
          control={control}
          render={({ field, fieldState }) => (
            <TextInput
              label='Логин'
              placeholder='Например, buhgalter'
              withAsterisk
              autoComplete='off'
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
              placeholder='Не короче 6 символов'
              withAsterisk
              autoComplete='new-password'
              error={fieldState.error?.message}
              {...field}
            />
          )}
        />
        <Text c='dimmed' fz='sm'>
          Новый пользователь всегда получает обычную роль: смотрит платежи и
          отмечает оплату.
        </Text>
        <Button
          type='submit'
          fullWidth
          disabled={!isDirty}
          loading={isSubmitting}
        >
          Создать пользователя
        </Button>
      </Stack>
    </form>
  )
}
