import { zodResolver } from '@hookform/resolvers/zod'
import { Button, PasswordInput, Stack, TextInput } from '@mantine/core'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  type IUser,
  optionalPasswordField,
  usernameField,
} from '@/entities/user'

import { useEditUser } from '../model/use-edit-user'

const editUserSchema = z.object({
  username: usernameField,
  password: optionalPasswordField,
})

type TEditUserSchema = z.infer<typeof editUserSchema>

interface IEditUserFormProps {
  user: IUser
  onDone: () => void
}

export function EditUserForm({ user, onDone }: IEditUserFormProps) {
  const { update } = useEditUser()
  const {
    control,
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = useForm<TEditUserSchema>({
    resolver: zodResolver(editUserSchema),
    defaultValues: { username: user.username, password: '' },
  })

  async function onSubmit({ username, password }: TEditUserSchema) {
    const isSaved = await update({
      id: user.id,
      username,
      password: password || undefined,
    })
    if (isSaved) {
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
              label='Новый пароль'
              placeholder='Оставьте пустым, чтобы не менять'
              autoComplete='new-password'
              error={fieldState.error?.message}
              {...field}
            />
          )}
        />
        <Button
          type='submit'
          fullWidth
          mt='xs'
          disabled={!isDirty}
          loading={isSubmitting}
        >
          Сохранить
        </Button>
      </Stack>
    </form>
  )
}
