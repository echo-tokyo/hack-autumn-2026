import { LoginForm } from '@/features/auth'

export function LoginPage() {
  return (
    <>
      <h1>Invoice Keeper</h1>
      <p>Вход в панель учёта регулярных платежей</p>
      <LoginForm />
    </>
  )
}
