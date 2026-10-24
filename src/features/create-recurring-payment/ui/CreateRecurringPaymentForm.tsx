import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { Controller, useForm } from 'react-hook-form'

import { PERIOD_LABELS } from '@/entities/recurring-payment'
import { CURRENCIES } from '@/shared/config'

import {
  recurringPaymentSchema,
  type TRecurringPaymentInput,
  type TRecurringPaymentSchema,
} from '../model/schema'
import { useCreateRecurringPayment } from '../model/use-create-recurring-payment'

const PERIOD_OPTIONS = [{ value: 'monthly', label: PERIOD_LABELS.monthly }]

interface ICreateRecurringPaymentFormProps {
  onDone: () => void
}

export function CreateRecurringPaymentForm({
  onDone,
}: ICreateRecurringPaymentFormProps) {
  const { create } = useCreateRecurringPayment()
  const {
    control,
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = useForm<TRecurringPaymentInput, unknown, TRecurringPaymentSchema>({
    resolver: zodResolver(recurringPaymentSchema),
    defaultValues: { name: '', currency: 'RUB', period: 'monthly' },
  })

  async function onSubmit(values: TRecurringPaymentSchema) {
    if (await create(values)) {
      onDone()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack gap='md'>
        <Controller
          name='name'
          control={control}
          render={({ field, fieldState }) => (
            <TextInput
              label='Название'
              withAsterisk
              placeholder='Например, аренда офиса'
              error={fieldState.error?.message}
              {...field}
            />
          )}
        />

        <SimpleGrid cols={2} spacing='md'>
          <Controller
            name='amount'
            control={control}
            render={({ field, fieldState }) => (
              <NumberInput
                label='Сумма'
                withAsterisk
                placeholder='0'
                min={0}
                thousandSeparator=' '
                decimalSeparator=','
                decimalScale={2}
                hideControls
                error={fieldState.error?.message}
                ref={field.ref}
                value={field.value ?? ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
          <Controller
            name='currency'
            control={control}
            render={({ field }) => (
              <Select
                label='Валюта'
                withAsterisk
                data={[...CURRENCIES]}
                allowDeselect={false}
                {...field}
              />
            )}
          />
        </SimpleGrid>

        <SimpleGrid cols={2} spacing='md'>
          <Controller
            name='firstDueDate'
            control={control}
            render={({ field, fieldState }) => (
              <DatePickerInput
                label='Дата ближайшей оплаты'
                withAsterisk
                placeholder='дд.мм.гггг'
                valueFormat='DD.MM.YYYY'
                error={fieldState.error?.message}
                ref={field.ref}
                value={field.value ?? null}
                onChange={(value) => field.onChange(value ?? undefined)}
              />
            )}
          />
          <Controller
            name='period'
            control={control}
            render={({ field }) => (
              <Select
                label='Периодичность'
                withAsterisk
                data={PERIOD_OPTIONS}
                allowDeselect={false}
                {...field}
              />
            )}
          />
        </SimpleGrid>

        <Text c='dimmed' fz='sm'>
          Первый период появится со статусом "Ожидает оплаты", следующие будут
          создаваться сами. Если такого числа нет в месяце, оплата придётся на
          последний день. Если до срока меньше 3 дней, бот напомнит сразу.
        </Text>

        <Button
          type='submit'
          fullWidth
          disabled={!isDirty}
          loading={isSubmitting}
        >
          Добавить платёж
        </Button>
      </Stack>
    </form>
  )
}
