import { Center, SimpleGrid, Stack, Text, Title } from '@mantine/core'

import { LoginForm } from '@/features/auth'
import { BrandPattern, BrandWatermark, Panel } from '@/shared/ui'

import styles from './styles.module.css'

const CARD_MAX_WIDTH = 880
const PANEL_MIN_HEIGHT = 480

export function LoginPage() {
  return (
    <Center component='main' mih='100dvh' p='md'>
      <SimpleGrid
        className={styles.card}
        cols={{ base: 1, sm: 2 }}
        spacing={4}
        w='100%'
        maw={CARD_MAX_WIDTH}
      >
        <Panel
          className={styles.brandPanel}
          bg='var(--mantine-color-black)'
          radius='xl'
          p='xl'
          mih={{ base: PANEL_MIN_HEIGHT / 2, sm: PANEL_MIN_HEIGHT }}
        >
          <Stack gap='xs' className={styles.content}>
            <Title order={1}>Вход в Invoice Keeper</Title>
            <Text c='dimmed' fz='lg'>
              что и когда оплатить, что уже оплачено и что просрочено
            </Text>
          </Stack>
          <BrandPattern className={styles.pattern} />
        </Panel>

        <Panel
          className={styles.formPanel}
          radius='xl'
          p='xl'
          mih={{ sm: PANEL_MIN_HEIGHT }}
        >
          <BrandWatermark />
          <Stack
            justify='space-between'
            h='100%'
            gap='xl'
            className={styles.content}
          >
            <LoginForm />
            <Text c='dimmed' fz='sm'>
              Нет учётной записи? Её создаёт администратор
            </Text>
          </Stack>
        </Panel>
      </SimpleGrid>
    </Center>
  )
}
