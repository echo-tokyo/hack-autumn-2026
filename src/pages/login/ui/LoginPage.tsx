import { Center, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core'

import { LoginForm } from '@/features/auth'
import { Logo } from '@/shared/ui'

const CARD_MAX_WIDTH = 880
const PANEL_MIN_HEIGHT = 480

export function LoginPage() {
  return (
    <Center mih='100dvh' p='md'>
      <SimpleGrid
        cols={{ base: 1, sm: 2 }}
        spacing={4}
        w='100%'
        maw={CARD_MAX_WIDTH}
      >
        <Paper
          bg='var(--color-surface-2)'
          radius='xl'
          p='xl'
          mih={{ sm: PANEL_MIN_HEIGHT }}
        >
          <Stack justify='space-between' h='100%' gap='xl'>
            <Stack gap='xs'>
              <Title order={1}>Вход в Invoice Keeper</Title>
              <Text c='dimmed' fz='lg'>
                что и когда оплатить, что уже оплачено и что просрочено
              </Text>
            </Stack>
            <Logo />
          </Stack>
        </Paper>

        <Paper
          bg='var(--color-surface-2)'
          radius='xl'
          p='xl'
          mih={{ sm: PANEL_MIN_HEIGHT }}
        >
          <Stack justify='space-between' h='100%' gap='xl'>
            <LoginForm />
            <Text c='dimmed' fz='sm'>
              Нет учётной записи? Её создаёт администратор
            </Text>
          </Stack>
        </Paper>
      </SimpleGrid>
    </Center>
  )
}
