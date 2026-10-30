import { request } from './api'

const SESSION_USERNAME_KEY = 'monitorduo.username'

export async function login(usuario, password = '') {
  const params = new URLSearchParams({
    action: 'login',
    usuario: usuario,
  })

  const data = await request(`index.php?${params.toString()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login', usuario, password }),
  })

  const username = data.usuario || usuario
  window.sessionStorage.setItem(SESSION_USERNAME_KEY, username)
  return data
}

export async function checkSession(signal) {
  return request('index.php?action=profile', { signal })
}

export async function logout() {
  try {
    await request('index.php?action=logout')
  } catch {
    // Si falla el servidor, se limpia la sesión local de todas formas
  } finally {
    window.sessionStorage.removeItem(SESSION_USERNAME_KEY)
  }
}

export function getSavedUser() {
  return window.sessionStorage.getItem(SESSION_USERNAME_KEY)
}

export function isAuthenticated() {
  return Boolean(getSavedUser())
}
