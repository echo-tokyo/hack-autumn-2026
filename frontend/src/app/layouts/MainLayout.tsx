import { AppShell, Burger, Group, Paper, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Outlet } from 'react-router'

import { Sidebar } from '@/widgets/sidebar'

import styles from './styles.module.css'

const NAVBAR_WIDTH = 280
const MOBILE_HEADER_HEIGHT = 56

export function MainLayout() {
  const [isNavbarOpened, { toggle, close }] = useDisclosure()

  return (
    <AppShell
      withBorder={false}
      padding={{ base: 'xs', sm: 'md' }}
      header={{ height: { base: MOBILE_HEADER_HEIGHT, sm: 0 } }}
      navbar={{
        width: NAVBAR_WIDTH,
        breakpoint: 'sm',
        collapsed: { mobile: !isNavbarOpened },
      }}
    >
      <AppShell.Header hiddenFrom='sm' px='md'>
        <Group h='100%' gap='sm'>
          <Burger
            opened={isNavbarOpened}
            onClick={toggle}
            size='sm'
            aria-label={isNavbarOpened ? 'Закрыть меню' : 'Открыть меню'}
          />
          <Text fw={800}>invoice keeper</Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p='md' className={styles.navbar}>
        <Sidebar onNavigate={close} />
      </AppShell.Navbar>

      <AppShell.Main className={styles.main}>
        <Paper className={styles.panel} bg='var(--color-surface-1)' radius='xl'>
          <Outlet />
        </Paper>
      </AppShell.Main>
    </AppShell>
  )
}
