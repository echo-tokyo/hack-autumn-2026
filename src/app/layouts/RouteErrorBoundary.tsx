import { Button, Center } from '@mantine/core'

import { MessageScreen } from '@/shared/ui'

export function RouteErrorBoundary() {
  return (
    <Center mih='100vh' p='md'>
      <MessageScreen
        title='Что-то пошло не так'
        description='Страница не смогла отрисоваться. Обновите её, чтобы продолжить.'
        action={
          <Button onClick={() => window.location.reload()}>
            Обновить страницу
          </Button>
        }
      />
    </Center>
  )
}
