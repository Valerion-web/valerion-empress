import api from './api'

export async function login(email: string, password: string) {
  const res = await api.post('/auth/login', { email, password })
  const data = res.data?.data
  if (data?.accessToken) {
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('user', JSON.stringify(data.user))
  }
  return data
}

export function logout() { localStorage.removeItem('accessToken'); localStorage.removeItem('user') }
export function isAuthenticated() { return !!localStorage.getItem('accessToken') }
export function getCurrentUser() { try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null } }
