import { request } from './api'

/**
 * Inicia sesión enviando credenciales al backend PHP.
 * Se envían en el cuerpo JSON (para el contrato final) y en query param
 * para compatibilidad con la implementación previa del backend.
 */
export async function login(usuario, contrasena = '') {
  const params = new URLSearchParams({
    action: 'login',
    usuario: usuario,
  })

  return request(`index.php?${params.toString()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login', usuario, contrasena }),
  })
}

/**
 * Consulta el perfil/sesión activa en el backend.
 * Devuelve 200 con la información del usuario si la sesión es válida,
 * o 401 si no está autenticado.
 */
export async function perfil(signal) {
  return request('index.php?action=profile', { signal })
}

/**
 * Alias de perfil para compatibilidad
 */
export async function checkSession(signal) {
  return perfil(signal)
}

/**
 * Cierra la sesión activa en el backend destruyendo la cookie.
 */
export async function logout() {
  return request('index.php?action=logout', {
    method: 'POST',
  })
}
