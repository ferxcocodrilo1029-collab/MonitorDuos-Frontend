import { useEffect, useState } from 'react'
import { perfil, logout as serviceLogout, login as serviceLogin } from '../services/authService'
import { AuthContext } from './AuthContextInstance'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    // Consultar al backend al montar o recargar si existe una sesión válida
    perfil()
      .then((data) => {
        if (isMounted) {
          setUser(data.usuario || 'Usuario')
          setLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null)
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  async function loginUser(usuario, contrasena) {
    const data = await serviceLogin(usuario, contrasena)
    setUser(data.usuario || usuario)
    return data
  }

  async function logoutUser() {
    try {
      await serviceLogout()
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        loginUser,
        logoutUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
