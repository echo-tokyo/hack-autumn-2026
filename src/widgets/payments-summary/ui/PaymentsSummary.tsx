import {
  ActionIcon,
  Button,
  Group,
  Paper,
  SimpleGrid,
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
            <IconInfoSquareRoundedFilled size={20} />
          </ActionIcon>
        </Tooltip>
      </Group>
      <Paper bg='var(--color-surface-2)' radius='lg' p='md'>
        {isLoading && (
          <SimpleGrid cols={{ base: 1, md: SKELETON_COUNT }} spacing='xl'>
            {Array.from({ length: SKELETON_COUNT }, (_, index) => (
              <Skeleton key={index} h={SKELETON_HEIGHT} />
            ))}
          </SimpleGrid>
        )}

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
