import { api } from './client'
import type { User } from '../types/user'

export function login(email: string, password: string) {
  return api.post<{ user: User }>('/auth/login', { email, password })
}

export function logout() {
  return api.post<void>('/auth/logout')
}

export function fetchCurrentUser() {
  return api.get<{ user: User }>('/auth/me')
}
