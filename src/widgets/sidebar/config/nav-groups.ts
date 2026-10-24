import {
  type Icon,
  IconCalendarFilled,
  IconListDetailsFilled,
} from '@tabler/icons-react'

import { ROUTES } from '@/shared/config'

export interface INavItem {
  label: string
  to: string
  icon: Icon
}

export interface INavGroup {
  label: string
  adminOnly: boolean
  items: INavItem[]
}

export const NAV_GROUPS: INavGroup[] = [
  {
    label: 'Платежи',
    adminOnly: false,
    items: [
      { label: 'Сводка', to: ROUTES.payments, icon: IconCalendarFilled },
      {
        label: 'Периоды оплат',
        to: ROUTES.occurrences,
        icon: IconListDetailsFilled,
      },
    ],
  },
]
