import {
  type Icon,
  IconCalendarFilled,
  IconListDetailsFilled,
  IconReceiptFilled,
  IconUserFilled,
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
  {
    label: 'Администрирование',
    adminOnly: true,
    items: [
      {
        label: 'Регулярные платежи',
        to: ROUTES.recurringPayments,
        icon: IconReceiptFilled,
      },
      { label: 'Пользователи', to: ROUTES.users, icon: IconUserFilled },
    ],
  },
]
