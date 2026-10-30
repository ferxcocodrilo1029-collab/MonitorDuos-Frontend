import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

function LoginPage() {
    const navigate = useNavigate()
    const { user, loading: isCheckingSession, loginUser } = useAuth()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [failedAttempts, setFailedAttempts] = useState(0)

    // Si ya existe sesión activa comprobada por el backend, redirigir a /home
    useEffect(() => {
        if (!isCheckingSession && user) {
            navigate('/home', { replace: true })
        }
    }, [isCheckingSession, user, navigate])

    async function handleSubmit(event) {
        event.preventDefault()

        const trimmedUser = username.trim()
        if (!trimmedUser) {
            setError('Por favor ingresa tu nombre de usuario.')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            await loginUser(trimmedUser, password)
            navigate('/home', { replace: true })
        } catch (err) {
            if (err.status === 401) {
                setError('Usuario o contraseña incorrectos')
            } else if (
                err.status === 0 ||
                err.message?.toLowerCase().includes('conexión') ||
                err.message?.toLowerCase().includes('fetch') ||
                err.message?.toLowerCase().includes('failed to fetch')
            ) {
                setError('No se pudo conectar con el servidor')
            } else {
                setError(err.message || 'Error al conectar con el servidor')
            }
            setFailedAttempts((attempts) => attempts + 1)
        } finally {
            setIsLoading(false)
        }
    }

    if (isCheckingSession) {
        return (
            <main className="login-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <p style={{ color: '#d0dfd8', fontSize: '1.1rem' }}>Verificando sesión con el servidor...</p>
            </main>
        )
    }

    return (
        <main className="login-page">
            <section
                className={`login-card${failedAttempts > 0 ? ` login-card--error-${failedAttempts % 2}` : ''}`}
                aria-labelledby="login-title"
            >
                <p className="login-eyebrow">MonitorDuo</p>
                <h1 id="login-title">Iniciar sesión</h1>
                <p className="login-description">Accede al panel de monitoreo del sistema.</p>

                <form onSubmit={handleSubmit}>
                    <label htmlFor="username">Usuario</label>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        value={username}
                        onChange={(event) => {
                            setUsername(event.target.value)
                            setError('')
                        }}
                        disabled={isLoading}
                        placeholder="Ej. admin"
                        required
                    />

                    <label htmlFor="password">Contraseña</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => {
                            setPassword(event.target.value)
                            setError('')
                        }}
                        disabled={isLoading}
                        placeholder="••••••••"
                    />

                    {error && (
                        <p style={{ color: '#ff8a80', fontWeight: 'bold', margin: '4px 0' }} role="alert">
                            {error}
                        </p>
                    )}

                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Conectando...' : 'Ingresar'}
                    </button>
                </form>
            </section>
        </main>
    )
}

export default LoginPage
