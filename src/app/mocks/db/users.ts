export interface IMockUser {
  id: number
  username: string
  password: string
  role: 'admin' | 'user'
}

export const mockUsers: IMockUser[] = [
  { id: 1, username: 'admin', password: 'admin', role: 'admin' },
  { id: 2, username: 'buhgalter', password: 'buhgalter', role: 'user' },
  { id: 3, username: 'manager', password: 'manager', role: 'user' },
]

export function toUserDto({ id, username, role }: IMockUser) {
  return { id, username, role }
}

export function findUserById(id: string | undefined) {
  return mockUsers.find((user) => String(user.id) === id)
}
