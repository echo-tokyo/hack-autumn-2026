import type { IUser } from '../model/types'

export function getUserRoleLabel(user: IUser): string {
  return user.isAdmin ? 'Администратор' : 'Пользователь'
}
