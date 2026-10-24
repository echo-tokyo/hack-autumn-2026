import { Center, Text } from '@mantine/core'

export function Logo() {
  return (
    <Center
      w={48}
      h={48}
      bg='white'
      style={{ borderRadius: 'var(--mantine-radius-sm)' }}
    >
      <Text c='black' fw={800} fz='lg' lh={1}>
        ik
      </Text>
    </Center>
  )
}
