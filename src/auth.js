const TOKEN_KEY = 'jashom_admin_token'
const ADMIN_KEY = 'jashom_admin_user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAuth(token, admin) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  if (admin) localStorage.setItem(ADMIN_KEY, JSON.stringify(admin))
}

export function getAdmin() {
  try {
    const raw = localStorage.getItem(ADMIN_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ADMIN_KEY)
}

export function isAuthenticated() {
  return !!getToken()
}
