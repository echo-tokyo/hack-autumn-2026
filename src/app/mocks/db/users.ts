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

let nextUserId = mockUsers.length + 1

export function toUserDto({ id, username, role }: IMockUser) {
  return { id, username, role }
}

export function findUserById(id: string | undefined) {
  return mockUsers.find((user) => String(user.id) === id)
}

export function isUsernameTaken(username: string, exceptId?: number) {
  return mockUsers.some(
    (user) => user.username === username && user.id !== exceptId,
  )
}

export function createMockUser(username: string, password: string) {
  const user: IMockUser = { id: nextUserId++, username, password, role: 'user' }
  mockUsers.push(user)
  return user
}

export function deleteMockUser(id: number) {
  const index = mockUsers.findIndex((user) => user.id === id)
  mockUsers.splice(index, 1)
}
