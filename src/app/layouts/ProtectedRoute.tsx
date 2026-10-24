import { Button, Center, Loader } from '@mantine/core'
import { Navigate, Outlet, useLocation } from 'react-router'

import { useGetMeQuery } from '@/entities/user'
import { ROUTES } from '@/shared/config'
import { MessageScreen } from '@/shared/ui'

export function ProtectedRoute() {
  const { data: user, error, isLoading, isFetching, refetch } = useGetMeQuery()
  const location = useLocation()

  if (isLoading) {
    return (
      <Center mih='100vh'>
        <Loader />
      </Center>
    )
  }

  if (user) {
    return <Outlet />
  }

  if (error && !('status' in error && error.status === 401)) {
    return (
      <Center mih='100vh' p='md'>
        <MessageScreen
          title='Сервер недоступен'
          description='Не удалось проверить вход. Попробуйте ещё раз через минуту.'
          action={
            <Button loading={isFetching} onClick={refetch}>
              Повторить
            </Button>
          }
        />
      </Center>
    )
  }

  return (
    <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />
  )
}
