import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getThresholds, isThresholdExceeded } from '../services/thresholdStorage'

const emptyMetric = '--'

function MetricCard({ title, currentValue }) {
    return (
        <article className="metric-card">
            <header>
                <h2>{title}</h2>
                <strong>{currentValue ?? emptyMetric}{currentValue !== null ? '%' : ''}</strong>
            </header>
            <div className="chart-placeholder">Gráfica pendiente de conexión</div>
        </article>
    )
}

function HomePage() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('live')
    const thresholds = getThresholds()
    const currentMetrics = {
        'Servidor pendiente de conexión': { CPU: null, 'Memoria RAM': null, Disco: null },
    }
    const exceededThresholds = thresholds.filter((threshold) => (
        isThresholdExceeded(threshold, currentMetrics[threshold.equipment]?.[threshold.metric])
    ))

    return (
        <main className="dashboard-page">
            <section className="dashboard-card">
                <header className="dashboard-header">
                    <div>
                        <p className="eyebrow">Sistema Monitor</p>
                        <h1>Panel de monitoreo</h1>
                    </div>
                    <div className="header-actions">
                        <button type="button" onClick={() => navigate('/alerts')}>Alertas</button>
                        <button type="button">Cerrar sesión</button>
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

                <nav className="dashboard-nav" aria-label="Vistas del monitor">
                    <button className={activeTab === 'live' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('live')}>Monitoreo en vivo</button>
                    <button className={activeTab === 'history' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('history')}>Histórico por fechas</button>
                </nav>

                {activeTab === 'live' ? (
                    <section aria-labelledby="live-title">
                        <h2 id="live-title">Monitoreo en vivo</h2>
                        <div className="charts-grid">
                            <MetricCard title="CPU" currentValue={currentMetrics['Servidor pendiente de conexión'].CPU} />
                            <MetricCard title="Memoria RAM" currentValue={currentMetrics['Servidor pendiente de conexión']['Memoria RAM']} />
                            <MetricCard title="Disco" currentValue={currentMetrics['Servidor pendiente de conexión'].Disco} />
                            <article className="metric-card metric-card-wide">
                                <h2>Uso combinado de recursos</h2>
                                <div className="chart-placeholder">Gráfica combinada pendiente de conexión</div>
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

