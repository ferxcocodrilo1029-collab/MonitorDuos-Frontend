const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const DEFAULT_TIMEOUT_MS = 10000

export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

/**
 * Cliente HTTP base para interactuar con la API PHP
 */
export async function request(endpoint, options = {}) {
  const { timeout = DEFAULT_TIMEOUT_MS, signal: userSignal, headers = {}, ...restOptions } = options
  const controller = new AbortController()

  const timeoutId = setTimeout(() => {
    controller.abort(new Error('La petición ha tardado más tiempo del esperado (tiempo límite excedido).'))
  }, timeout)

  if (userSignal) {
    userSignal.addEventListener('abort', () => controller.abort(userSignal.reason))
  }

  // Si no se configuró VITE_API_URL, se utiliza el proxy '/api' relativo
  const base = API_BASE_URL || '/api'
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${base}/${endpoint.replace(/^\//, '')}`

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...headers,
      },
      ...restOptions,
    })

    let data = null
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      data = await response.json()
    } else {
      const text = await response.text()
      try {
        data = JSON.parse(text)
      } catch {
        data = { raw: text }
      }
    }

    if (!response.ok) {
      const errorMsg = data?.error || data?.mensaje || `Error HTTP ${response.status}`
      throw new ApiError(errorMsg, response.status, data)
    }

    return data
  } catch (err) {
    if (err instanceof ApiError) {
      throw err
    }
    if (err.name === 'AbortError') {
      throw new ApiError(err.message || 'La petición fue cancelada o superó el tiempo límite.', 408)
    }
    throw new ApiError('Sin conexión con el servidor backend.', 0, err)
  } finally {
    clearTimeout(timeoutId)
  }
}

