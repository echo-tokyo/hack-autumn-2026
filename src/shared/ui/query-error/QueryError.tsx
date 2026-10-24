import { Button, Stack, Text } from '@mantine/core'

interface IQueryErrorProps {
  message: string
  onRetry: () => void
}

export function QueryError({ message, onRetry }: IQueryErrorProps) {
  return (
    <Stack gap='sm' align='flex-start' py='sm'>
      <Text c='dimmed'>{message}</Text>
      <Button variant='secondary' onClick={onRetry}>
        Повторить
      </Button>
    </Stack>
  )
}
