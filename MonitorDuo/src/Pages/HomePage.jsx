import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getThresholds, isThresholdExceeded } from '../services/thresholdStorage'

const emptyMetric = '--'
const SESSION_USERNAME_KEY = 'monitorduo.username'

function MetricCard({ title, currentValue, isSimulated }) {
    return (
        <article className="metric-card">
            <header>
                <h2>{title}</h2>
                <strong>{currentValue ?? emptyMetric}{currentValue !== null ? '%' : ''}</strong>
            </header>
            <div className="chart-placeholder">
                {isSimulated ? 'Lectura simulada' : 'Gráfica pendiente de conexión'}
            </div>
        </article>
    )
}

function HomePage() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('live')
    const [simulationActive, setSimulationActive] = useState(false)
    const username = window.sessionStorage.getItem(SESSION_USERNAME_KEY) || 'Usuario'
    const thresholds = getThresholds()
    const currentMetrics = {
        'Servidor pendiente de conexión': simulationActive
            ? { CPU: 95, 'Memoria RAM': 95, Disco: 95 }
            : { CPU: null, 'Memoria RAM': null, Disco: null },
    }
    const exceededThresholds = thresholds.filter((threshold) => (
        isThresholdExceeded(threshold, currentMetrics[threshold.equipment]?.[threshold.metric])
    ))

    function handleLogout() {
        window.sessionStorage.removeItem(SESSION_USERNAME_KEY)
        navigate('/', { replace: true })
    }

    return (
        <main className="dashboard-page">
            <section className="dashboard-card">
                <header className="dashboard-header">
                    <div>
                        <p className="eyebrow">Sistema Monitor</p>
                        <h1>Panel de monitoreo</h1>
                        <p className="welcome-message">Hola, {username}</p>
                    </div>
                    <div className="header-actions">
                        <button
                            className="simulation-button"
                            type="button"
                            aria-pressed={simulationActive}
                            onClick={() => setSimulationActive((active) => !active)}
                        >
                            {simulationActive ? 'Detener simulación' : 'Simular alerta'}
                        </button>
                        <button className="alerts-button" type="button" onClick={() => navigate('/alerts')}>Alertas</button>
                        <button className="logout-button" type="button" onClick={handleLogout}>Cerrar sesión</button>
                    </div>
                </header>

                {exceededThresholds.length > 0 && (
                    <aside className="active-alert" role="alert">
                        <strong>Alertas activas</strong>
                        <span>{exceededThresholds.map((threshold) => `${threshold.metric} superó ${threshold.value}%`).join(' | ')}</span>
                    </aside>
                )}

                <section className="host-selector" aria-labelledby="host-selector-title">
                    <label id="host-selector-title" htmlFor="host">Servidor monitoreado</label>
                    <select id="host" defaultValue="">
                        <option value="" disabled>Selecciona un servidor</option>
                        <option value="placeholder">Servidor pendiente de conexión</option>
                    </select>
                </section>

                <p className={`server-status${simulationActive ? ' is-simulated' : ' is-disconnected'}`} role="status">
                    <span className="server-status-indicator" aria-hidden="true" />
                    {simulationActive ? 'Simulación activa: datos ficticios' : 'Sin conexión al servidor'}
                </p>

                <nav className="dashboard-nav" aria-label="Vistas del monitor">
                    <button className={activeTab === 'live' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('live')}>Monitoreo en vivo</button>
                    <button className={activeTab === 'history' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('history')}>Histórico por fechas</button>
                </nav>

                {activeTab === 'live' ? (
                    <section aria-labelledby="live-title">
                        <h2 id="live-title">Monitoreo en vivo</h2>
                        <div className="charts-grid">
                            <MetricCard title="CPU" currentValue={currentMetrics['Servidor pendiente de conexión'].CPU} isSimulated={simulationActive} />
                            <MetricCard title="Memoria RAM" currentValue={currentMetrics['Servidor pendiente de conexión']['Memoria RAM']} isSimulated={simulationActive} />
                            <MetricCard title="Disco" currentValue={currentMetrics['Servidor pendiente de conexión'].Disco} isSimulated={simulationActive} />
                            <article className="metric-card metric-card-wide">
                                <h2>Uso combinado de recursos</h2>
                                <div className="chart-placeholder">
                                    {simulationActive ? 'Lecturas simuladas para probar alertas' : 'Gráfica combinada pendiente de conexión'}
                                </div>
                            </article>
                        </div>
                    </section>
                ) : (
                    <section aria-labelledby="history-title">
                        <h2 id="history-title">Histórico por fechas</h2>
                        <form className="history-filter-bar" onSubmit={(event) => event.preventDefault()}>
                            <label htmlFor="from-date">Fecha inicial</label>
                            <input id="from-date" type="date" />
                            <label htmlFor="to-date">Fecha final</label>
                            <input id="to-date" type="date" />
                            <button type="submit">Consultar histórico</button>
                        </form>
                        <div className="history-stats-grid">
                            <article><span>Total lecturas</span><strong>{emptyMetric}</strong></article>
                            <article><span>Promedio CPU</span><strong>{emptyMetric}</strong></article>
                            <article><span>Promedio RAM</span><strong>{emptyMetric}</strong></article>
                            <article><span>Promedio disco</span><strong>{emptyMetric}</strong></article>
                        </div>
                        <div className="chart-placeholder">Histórico pendiente de conexión</div>
                    </section>
                )}
            </section>
        </main>
    )
}

export default HomePage

