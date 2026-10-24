import {
  Box,
  Group,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core'

import { formatAmount, formatMoney } from '@/shared/lib'

import type { ICurrencyTotals } from '../model/types'

const SEGMENTS = [
  { key: 'paid', label: 'оплачено', color: 'var(--color-success)' },
  { key: 'overdue', label: 'просрочено', color: 'var(--color-danger)' },
  { key: 'toPay', label: 'к оплате', color: 'var(--color-accent)' },
] as const

const SWATCH_SIZE = 8

interface ICurrencyBarProps {
  totals: ICurrencyTotals
}

function CurrencyBar({ totals }: ICurrencyBarProps) {
  const sum = totals.paid + totals.overdue + totals.toPay
  const segments = SEGMENTS.filter((segment) => totals[segment.key] > 0)

  return (
    <Stack gap='xs'>
      <Group justify='space-between' align='baseline'>
        <Text ff='heading' fw={700} fz='lg'>
          {totals.currency}
        </Text>
        <Text fw={700}>
          {formatAmount(totals.toPay)}{' '}
          <Text span c='dimmed' fz='sm' fw={400}>
            к оплате
          </Text>
        </Text>
      </Group>

      <Progress.Root size='lg' radius='xs' bg='var(--color-surface-3)'>
        {segments.map((segment) => (
          <Tooltip
            key={segment.key}
            label={`${segment.label}: ${formatMoney(totals[segment.key], totals.currency)}`}
          >
            <Progress.Section
              value={(totals[segment.key] / sum) * 100}
              color={segment.color}
            />
          </Tooltip>
        ))}
      </Progress.Root>

      <Group gap='md'>
        {segments.map((segment) => (
          <Group key={segment.key} gap={6} wrap='nowrap'>
            <Box w={SWATCH_SIZE} h={SWATCH_SIZE} bg={segment.color} />
            <Text fz='sm' c='dimmed'>
              {segment.label} {formatAmount(totals[segment.key])}
            </Text>
          </Group>
        ))}
      </Group>
    </Stack>
  )
}

interface ICurrencyTotalsBarsProps {
  totals: ICurrencyTotals[]
}

export function CurrencyTotalsBars({ totals }: ICurrencyTotalsBarsProps) {
  return (
    <SimpleGrid cols={{ base: 1, md: 3 }} spacing='xl' verticalSpacing='lg'>
      {totals.map((row) => (
        <CurrencyBar key={row.currency} totals={row} />
      ))}
    </SimpleGrid>
  )
}
