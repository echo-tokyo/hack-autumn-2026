export interface IUser {
  id: number
  username: string
  isAdmin: boolean
}

export interface ILoginRequest {
  username: string
  password: string
}

export interface ICreateUser {
  username: string
  password: string
}

export interface IUpdateUser {
  id: number
  username: string
  password?: string
}
