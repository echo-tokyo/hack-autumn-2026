import { Button } from '@mantine/core'
import { Link } from 'react-router'

import { ROUTES } from '@/shared/config'
import { MessageScreen } from '@/shared/ui'

export function NotFoundPage() {
  return (
    <MessageScreen
      title='Страница не найдена'
      description='Такого адреса нет. Проверьте ссылку или вернитесь к платежам.'
      action={
        <Button component={Link} to={ROUTES.payments}>
          К списку платежей
        </Button>
      }
    />
  )
}
