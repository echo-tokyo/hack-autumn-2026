import { Text } from '@mantine/core'

export function Logo() {
  return (
    <Text
      component='span'
      display='block'
      fw={800}
      fz='xl'
      lh={0.9}
      c='var(--color-text-faint)'
    >
      invoice
      <br />
      keeper
    </Text>
  )
}
