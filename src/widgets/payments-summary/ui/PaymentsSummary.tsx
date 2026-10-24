import {
  ActionIcon,
  Button,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core'
import { IconInfoSquareRoundedFilled } from '@tabler/icons-react'

import {
  CurrencyTotalsBars,
  useGetPaymentsSummaryQuery,
} from '@/entities/payment-summary'

const SKELETON_HEIGHT = 80
const HINT = 'Суммы считаются отдельно по каждой валюте, без конвертации'

export function PaymentsSummary() {
  const { data, isLoading, isError, refetch } = useGetPaymentsSummaryQuery()

  return (
    <Stack component='section' gap='sm'>
      <Group gap='xs'>
        <Title order={2}>Итоги по валютам</Title>
        <Tooltip label={HINT} multiline w={240} withArrow>
          <ActionIcon variant='subtle' color='gray' aria-label={HINT}>
            <IconInfoSquareRoundedFilled size={20} />
          </ActionIcon>
        </Tooltip>
      </Group>
      <Paper bg='var(--color-surface-2)' radius='lg' p='md'>
        {isLoading && <Skeleton h={SKELETON_HEIGHT} />}

        {!isLoading && (isError || !data) && (
          <Stack gap='sm' align='flex-start'>
            <Text c='dimmed'>Не удалось загрузить итоги.</Text>
            <Button variant='default' onClick={refetch}>
              Повторить
            </Button>
          </Stack>
        )}

        {data && <CurrencyTotalsBars totals={data.totals} />}
      </Paper>
    </Stack>
  )
}
