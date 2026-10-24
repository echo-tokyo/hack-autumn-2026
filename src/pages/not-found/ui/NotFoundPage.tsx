import { Link } from 'react-router'

import { ROUTES } from '@/shared/config'

export function NotFoundPage() {
  return (
    <>
      <h1>Страница не найдена</h1>
      <p>Такого адреса нет. Проверьте ссылку или вернитесь к платежам.</p>
      <Link to={ROUTES.payments}>К списку платежей</Link>
    </>
  )
}
