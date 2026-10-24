export type TUserRole = 'admin' | 'user'

export interface IUser {
  id: number
  username: string
  role: TUserRole
}

export interface ILoginRequest {
  username: string
  password: string
}
