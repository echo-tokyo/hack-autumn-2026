import type { IUser, TUserRole } from '../model/types'

export const USER_ROLE_LABELS: Record<TUserRole, string> = {
  admin: 'Администратор',
  user: 'Пользователь',
}

export function isAdmin(user: IUser): boolean {
  return user.role === 'admin'
}
