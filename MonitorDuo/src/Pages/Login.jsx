import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function LoginPage() {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    function handleSubmit(event) {
        event.preventDefault()
        navigate('/home', { replace: true })
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

                    <button type="submit">Ingresar</button>
                </form>
            </section>
        </main>
    )
}

export default LoginPage
    