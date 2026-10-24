export type TUserRole = 'admin' | 'user'

export interface IUser {
  id: number
  login: string
  role: TUserRole
}
