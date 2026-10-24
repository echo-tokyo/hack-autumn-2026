import { NavLink, Stack, Text } from '@mantine/core'
import { NavLink as RouterNavLink } from 'react-router'

import { ICON_SIZE, ICON_STROKE } from '@/shared/config'

import type { INavGroup } from '../config/nav-groups'
import styles from './styles.module.css'

interface ISidebarNavProps {
  groups: INavGroup[]
  onNavigate?: () => void
}

export function SidebarNav({ groups, onNavigate }: ISidebarNavProps) {
  return (
    <Stack component='nav' aria-label='Основная навигация' gap='lg'>
      {groups.map((group) => (
        <Stack key={group.label} gap={4}>
          <Text c='dimmed' fz='sm' px='sm'>
            {group.label}
          </Text>
          {group.items.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              className={styles.link}
              component={RouterNavLink}
              to={to}
              end
              label={label}
              rightSection={<Icon size={ICON_SIZE} stroke={ICON_STROKE} />}
              onClick={onNavigate}
            />
          ))}
        </Stack>
      ))}
    </Stack>
  )
}
