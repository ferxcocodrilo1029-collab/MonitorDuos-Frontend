import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_BASE_URL ||
    'http://localhost/'

function LoginPage() {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleSubmit(event) {
        event.preventDefault()
        setError('')
        setIsSubmitting(true)

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ username, password }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'No fue posible iniciar sesión')
            }

            navigate('/home', { replace: true })
        } catch (requestError) {
            setError(requestError.message || 'No fue posible conectar con el servidor')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="login-page">
            <section className="login-card" aria-labelledby="login-title">
                <p className="login-eyebrow">MonitorDuo</p>
                <h1 id="login-title">Iniciar sesión</h1>
                <p className="login-description">Accede al panel de monitoreo.</p>

                <form onSubmit={handleSubmit}>
                    <label htmlFor="username">Usuario</label>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        required
                    />

                    <label htmlFor="password">Contraseña</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                    />

                    {error && <p className="login-error" role="alert">{error}</p>}

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>
            </section>
        </main>
    )
}

export default LoginPage
    