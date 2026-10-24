import {
  ActionIcon,
  Group,
  SimpleGrid,
  Skeleton,
  Stack,
  Title,
  Tooltip,
} from '@mantine/core'
import { IconInfoSquareRoundedFilled } from '@tabler/icons-react'

import {
  CurrencyTotalsBars,
  useGetPaymentsSummaryQuery,
} from '@/entities/payment-summary'
import { ICON_SIZE } from '@/shared/config'
import { Panel, QueryError } from '@/shared/ui'

const SKELETON_COUNT = 3
const SKELETON_HEIGHT = 72
const HINT = 'Суммы считаются отдельно по каждой валюте, без конвертации'

export function PaymentsSummary() {
  const { data, isLoading, isError, refetch } = useGetPaymentsSummaryQuery()

  return (
    <Stack component='section' gap='sm'>
      <Group gap='xs'>
        <Title order={2}>Итоги по валютам</Title>
        <Tooltip label={HINT} multiline w={240} withArrow>
          <ActionIcon variant='subtle' color='gray' aria-label={HINT}>
            <IconInfoSquareRoundedFilled size={ICON_SIZE} />
          </ActionIcon>
        </Tooltip>
      </Group>
      <Panel p='md'>
        {isLoading && (
          <SimpleGrid cols={{ base: 1, md: SKELETON_COUNT }} spacing='xl'>
            {Array.from({ length: SKELETON_COUNT }, (_, index) => (
              <Skeleton key={index} h={SKELETON_HEIGHT} />
            ))}
          </SimpleGrid>
        )}

        {!isLoading && (isError || !data) && (
          <QueryError message='Не удалось загрузить итоги.' onRetry={refetch} />
        )}

        {data && <CurrencyTotalsBars totals={data.totals} />}
      </Panel>
    </Stack>
  )
}
