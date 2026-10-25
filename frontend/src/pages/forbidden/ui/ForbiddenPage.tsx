import { Button } from '@mantine/core'
import { Link } from 'react-router'

import { ROUTES } from '@/shared/config'
import { MessageScreen } from '@/shared/ui'

export function ForbiddenPage() {
  return (
    <MessageScreen
      title='Нет доступа'
      description='Этот раздел доступен только администратору. Вы можете смотреть платежи и отмечать оплату.'
      action={
        <Button component={Link} to={ROUTES.payments}>
          К списку платежей
        </Button>
      }
    />
  )
}
