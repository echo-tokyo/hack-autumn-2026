export type TUserRole = 'admin' | 'user'

export interface IUser {
  id: number
  login: string
  role: TUserRole
}

export interface ILoginRequest {
  login: string
  password: string
}
