const TOKEN_KEY = 'parkspot_token'
const USER_KEY  = 'parkspot_user'

export interface AuthUser {
  id:            string
  name:          string
  email:         string
  phone:         string
  role:          'user' | 'owner'
  businessName?: string
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export function saveAuth(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  // Set a session cookie so Next.js middleware can protect routes
  document.cookie = 'parkspot_session=1; path=/; max-age=604800; SameSite=Lax'
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  // Clear the session cookie
  document.cookie = 'parkspot_session=; path=/; max-age=0'
}

export function isLoggedIn(): boolean {
  return !!getToken()
}
