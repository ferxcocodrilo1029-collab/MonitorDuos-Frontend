import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const LOCAL_USERNAME = 'numberone'
const LOCAL_PASSWORD = '1234'

function LoginPage() {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    function handleSubmit(event) {
        event.preventDefault()

        if (username !== LOCAL_USERNAME || password !== LOCAL_PASSWORD) {
            setError('Intruso Intruso Intruso')
            return
        }

        setError('')
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
                        onChange={(event) => {
                            setUsername(event.target.value)
                            setError('')
                        }}
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
                        required
                    />

                    {error && <p style={{ color: 'red', fontWeight: 'bold' }} role="alert">{error}</p>}
                    <button type="submit">Ingresar</button>
                </form>
            </section>
        </main>
    )
}

export default LoginPage
    