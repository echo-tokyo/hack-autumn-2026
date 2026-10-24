// Mock backend keeps its own shapes, independent of frontend types
export interface IMockUser {
  id: number
  login: string
  password: string
  role: 'admin' | 'user'
}

export const mockUsers: IMockUser[] = [
  { id: 1, login: 'admin', password: 'admin', role: 'admin' },
  { id: 2, login: 'buhgalter', password: 'buhgalter', role: 'user' },
  { id: 3, login: 'manager', password: 'manager', role: 'user' },
]

export function toUserDto({ id, login, role }: IMockUser) {
  return { id, login, role }
}

export function findUserById(id: string | undefined) {
  return mockUsers.find((user) => String(user.id) === id)
}
