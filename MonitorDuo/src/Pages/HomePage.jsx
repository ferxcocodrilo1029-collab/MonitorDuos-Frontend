import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { getLiveMetrics, getHistoryMetrics } from '../services/monitorService'
import { getThresholds, isThresholdExceeded } from '../services/thresholdStorage'

const emptyMetric = '--'

function MetricCard({ title, currentValue, unit = '%' }) {
    return (
        <article className="metric-card">
            <header>
                <h2>{title}</h2>
                <strong>
                    {currentValue !== null && currentValue !== undefined ? `${currentValue}${unit}` : emptyMetric}
                </strong>
            </header>
            <div className="chart-placeholder">
                {currentValue !== null && currentValue !== undefined ? (
                    <div style={{ width: '80%', padding: '12px 0' }}>
                        <div style={{
                            height: '10px',
                            background: '#d0dfd8',
                            borderRadius: '5px',
                            overflow: 'hidden',
                            marginBottom: '8px'
                        }}>
                            <div style={{
                                width: `${Math.min(100, Math.max(0, currentValue))}%`,
                                height: '100%',
                                background: currentValue > 80 ? '#e53935' : currentValue > 60 ? '#f57c00' : '#2e7d32',
                                transition: 'width 0.4s ease'
                            }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#556b66' }}>
                            Uso actual: {currentValue}%
                        </span>
                    </div>
                ) : (
                    'Esperando datos del servidor...'
                )}
            </div>
        </article>
    )
}

function HomePage() {
    const navigate = useNavigate()
    const { user, logoutUser } = useAuth()
    const [activeTab, setActiveTab] = useState('live')
    const username = user || 'Usuario'

    // Estado del servidor y métricas en vivo
    const [serverName, setServerName] = useState('Detectando equipo...')
    const [serverStatus, setServerStatus] = useState('connecting') // 'connected' | 'disconnected' | 'connecting'
    const [serverError, setServerError] = useState('')
    const [liveMetrics, setLiveMetrics] = useState({
        cpu: null,
        ram: null,
        disco: null,
        timestamp: null,
    })

    // Histórico por fechas
    const [historyStart, setHistoryStart] = useState('')
    const [historyEnd, setHistoryEnd] = useState('')
    const [historyLoading, setHistoryLoading] = useState(false)
    const [historyError, setHistoryError] = useState('')
    const [historyStats, setHistoryStats] = useState({
        total: emptyMetric,
        avgCpu: emptyMetric,
        avgRam: emptyMetric,
        avgDisco: emptyMetric,
        records: [],
    })

    const liveAbortRef = useRef(null)
    const historyAbortRef = useRef(null)

    // Validar sesión inicial con backend
    useEffect(() => {
        const controller = new AbortController()
        checkSession(controller.signal).catch(() => {
            // Si la sesión no es válida en backend, pero hay usuario en sessionStorage,
            // podemos permitir o limpiar según política.
        })
        return () => controller.abort()
    }, [])

    // Función para consultar métricas en vivo
    const fetchLiveMetrics = useCallback(async () => {
        if (liveAbortRef.current) {
            liveAbortRef.current.abort()
        }
        liveAbortRef.current = new AbortController()

        try {
            const data = await getLiveMetrics(liveAbortRef.current.signal)
            if (data?.datos) {
                setLiveMetrics({
                    cpu: Number(data.datos.cpu_uso),
                    ram: Number(data.datos.ram_uso),
                    disco: Number(data.datos.disco_uso),
                    timestamp: data.timestamp || new Date().toLocaleTimeString(),
                })
                if (data.equipo) {
                    setServerName(data.equipo)
                }
                setServerStatus('connected')
                setServerError('')
            }
        } catch (err) {
            if (err.name !== 'AbortError' && err.message !== 'The user aborted a request.') {
                setServerStatus('disconnected')
                setServerError(err.message || 'No se pudo conectar con el backend.')
            }
        }
    }, [])

    // Sondeo periódico (polling) en la pestaña live
    // REGLA: Las peticiones automáticas se detienen al desmontar el componente
    useEffect(() => {
        let isMounted = true

        if (activeTab === 'live') {
            fetchLiveMetrics()
            const intervalId = setInterval(() => {
                if (isMounted) {
                    fetchLiveMetrics()
                }
            }, 3000)

            return () => {
                isMounted = false
                clearInterval(intervalId)
                if (liveAbortRef.current) {
                    liveAbortRef.current.abort()
                }
            }
        }
    }, [activeTab, fetchLiveMetrics])

    // Umbrales y alertas activas
    const thresholds = getThresholds()
    const exceededThresholds = thresholds.filter((threshold) => {
        let val = null
        if (threshold.metric === 'CPU') val = liveMetrics.cpu
        if (threshold.metric === 'Memoria RAM') val = liveMetrics.ram
        if (threshold.metric === 'Disco') val = liveMetrics.disco
        return isThresholdExceeded(threshold, val)
    })

    async function handleLogout() {
        await logoutUser()
        navigate('/', { replace: true })
    }

    // Consulta de histórico
    async function handleHistorySubmit(event) {
        event.preventDefault()

        if (!historyStart || !historyEnd) {
            setHistoryError('Debes seleccionar tanto la fecha inicial como la final.')
            return
        }

        if (new Date(historyStart) > new Date(historyEnd)) {
            setHistoryError('La fecha inicial no puede ser posterior a la fecha final.')
            return
        }

        setHistoryLoading(true)
        setHistoryError('')

        if (historyAbortRef.current) {
            historyAbortRef.current.abort()
        }
        historyAbortRef.current = new AbortController()

        try {
            const result = await getHistoryMetrics(historyStart, historyEnd, historyAbortRef.current.signal)
            setHistoryStats({
                total: result.total,
                avgCpu: result.total > 0 ? `${result.avgCpu}%` : emptyMetric,
                avgRam: result.total > 0 ? `${result.avgRam}%` : emptyMetric,
                avgDisco: result.total > 0 ? `${result.avgDisco}%` : emptyMetric,
                records: result.records,
            })
            if (result.total === 0) {
                setHistoryError('No se encontraron registros en el rango de fechas seleccionado.')
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                setHistoryError(err.message || 'Error al consultar el historial.')
            }
        } finally {
            setHistoryLoading(false)
        }
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
                        <button className="alerts-button" type="button" onClick={() => navigate('/alerts')}>
                            Configurar Alertas
                        </button>
                        <button className="logout-button" type="button" onClick={handleLogout}>
                            Cerrar sesión
                        </button>
                    </div>
                </header>

                {exceededThresholds.length > 0 && (
                    <aside className="active-alert" role="alert">
                        <strong>⚠️ Alertas activas en tiempo real:</strong>
                        <span>
                            {exceededThresholds
                                .map((threshold) => `${threshold.metric} superó el umbral (${threshold.value}%)`)
                                .join(' | ')}
                        </span>
                    </aside>
                )}

                <section className="host-selector" aria-labelledby="host-selector-title">
                    <label id="host-selector-title" htmlFor="host">Servidor monitoreado</label>
                    <select id="host" value={serverName} onChange={(e) => setServerName(e.target.value)}>
                        <option value={serverName}>{serverName}</option>
                    </select>
                </section>

                <p
                    className={`server-status ${
                        serverStatus === 'connected'
                            ? 'is-connected'
                            : serverStatus === 'connecting'
                            ? ''
                            : 'is-disconnected'
                    }`}
                    role="status"
                >
                    <span className="server-status-indicator" aria-hidden="true" />
                    {serverStatus === 'connected' && `Conectado al servidor (${serverName}) - Última lectura: ${liveMetrics.timestamp || 'reciente'}`}
                    {serverStatus === 'connecting' && 'Conectando al backend de monitoreo...'}
                    {serverStatus === 'disconnected' && `Sin conexión al servidor: ${serverError}`}
                </p>

                <nav className="dashboard-nav" aria-label="Vistas del monitor">
                    <button
                        className={activeTab === 'live' ? 'is-active' : ''}
                        type="button"
                        onClick={() => setActiveTab('live')}
                    >
                        Monitoreo en vivo
                    </button>
                    <button
                        className={activeTab === 'history' ? 'is-active' : ''}
                        type="button"
                        onClick={() => setActiveTab('history')}
                    >
                        Histórico por fechas
                    </button>
                </nav>

                {activeTab === 'live' ? (
                    <section aria-labelledby="live-title">
                        <h2 id="live-title">Monitoreo en vivo</h2>
                        <div className="charts-grid">
                            <MetricCard title="CPU" currentValue={liveMetrics.cpu} />
                            <MetricCard title="Memoria RAM" currentValue={liveMetrics.ram} />
                            <MetricCard title="Disco" currentValue={liveMetrics.disco} />
                            <article className="metric-card metric-card-wide">
                                <h2>Uso combinado de recursos ({serverName})</h2>
                                <div className="chart-placeholder" style={{ padding: '20px' }}>
                                    {liveMetrics.cpu !== null ? (
                                        <div style={{ width: '100%', maxWidth: '500px', display: 'grid', gap: '14px' }}>
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                                                    <span>CPU</span>
                                                    <strong>{liveMetrics.cpu}%</strong>
                                                </div>
                                                <div style={{ height: '8px', background: '#dce8e2', borderRadius: '4px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${liveMetrics.cpu}%`, height: '100%', background: '#3b82f6' }} />
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                                                    <span>Memoria RAM</span>
                                                    <strong>{liveMetrics.ram}%</strong>
                                                </div>
                                                <div style={{ height: '8px', background: '#dce8e2', borderRadius: '4px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${liveMetrics.ram}%`, height: '100%', background: '#10b981' }} />
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                                                    <span>Disco</span>
                                                    <strong>{liveMetrics.disco}%</strong>
                                                </div>
                                                <div style={{ height: '8px', background: '#dce8e2', borderRadius: '4px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${liveMetrics.disco}%`, height: '100%', background: '#f59e0b' }} />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <span>Esperando métricas en vivo...</span>
                                    )}
                                </div>
                            </article>
                        </div>
                    </section>
                ) : (
                    <section aria-labelledby="history-title">
                        <h2 id="history-title">Histórico por fechas</h2>
                        <form className="history-filter-bar" onSubmit={handleHistorySubmit}>
                            <label htmlFor="from-date">Fecha inicial</label>
                            <input
                                id="from-date"
                                type="date"
                                value={historyStart}
                                onChange={(e) => setHistoryStart(e.target.value)}
                                disabled={historyLoading}
                                required
                            />
                            <label htmlFor="to-date">Fecha final</label>
                            <input
                                id="to-date"
                                type="date"
                                value={historyEnd}
                                onChange={(e) => setHistoryEnd(e.target.value)}
                                disabled={historyLoading}
                                required
                            />
                            <button type="submit" disabled={historyLoading}>
                                {historyLoading ? 'Consultando...' : 'Consultar histórico'}
                            </button>
                        </form>

                        {historyError && (
                            <p className="form-error" style={{ marginBottom: '16px' }} role="alert">
                                {historyError}
                            </p>
                        )}

                        <div className="history-stats-grid">
                            <article>
                                <span>Total lecturas</span>
                                <strong>{historyStats.total}</strong>
                            </article>
                            <article>
                                <span>Promedio CPU</span>
                                <strong>{historyStats.avgCpu}</strong>
                            </article>
                            <article>
                                <span>Promedio RAM</span>
                                <strong>{historyStats.avgRam}</strong>
                            </article>
                            <article>
                                <span>Promedio disco</span>
                                <strong>{historyStats.avgDisco}</strong>
                            </article>
                        </div>

                        {historyStats.records.length > 0 ? (
                            <div style={{
                                width: '100%',
                                overflowX: 'auto',
                                marginTop: '16px',
                                background: '#f7fbf5',
                                borderRadius: '12px',
                                padding: '16px',
                                border: '1px solid #c8d9d1'
                            }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#19333b', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #c8d9d1' }}>
                                            <th style={{ padding: '8px' }}>Fecha / Hora</th>
                                            <th style={{ padding: '8px' }}>CPU (%)</th>
                                            <th style={{ padding: '8px' }}>RAM (%)</th>
                                            <th style={{ padding: '8px' }}>Disco (%)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historyStats.records.map((row) => (
                                            <tr key={row.sesion_id} style={{ borderBottom: '1px solid #e2ece7' }}>
                                                <td style={{ padding: '8px' }}>{row.fecha_registro}</td>
                                                <td style={{ padding: '8px', fontWeight: 'bold' }}>{row.cpu_uso}%</td>
                                                <td style={{ padding: '8px', fontWeight: 'bold' }}>{row.ram_uso}%</td>
                                                <td style={{ padding: '8px', fontWeight: 'bold' }}>{row.disco_uso}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="chart-placeholder">
                                {historyLoading ? 'Cargando datos del servidor...' : 'Selecciona un rango de fechas para consultar registros históricos.'}
                            </div>
                        )}
                    </section>
                )}
            </section>
        </main>
    )
}

export default HomePage
