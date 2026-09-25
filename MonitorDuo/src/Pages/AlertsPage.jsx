import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    getThresholds,
    saveThresholds,
} from '../services/thresholdStorage'

const EMPTY_FORM = {
    equipment: 'Servidor pendiente de conexión',
    metric: 'CPU',
    operator: 'gt',
    value: '',
    unit: '%',
}

function formatThreshold(threshold) {
    return `${threshold.equipment}: ${threshold.metric} ${threshold.operator === 'gt' ? 'mayor a' : 'menor a'} ${threshold.value}${threshold.unit}`
}

function AlertsPage() {
    const navigate = useNavigate()
    const [thresholds, setThresholds] = useState(getThresholds)
    const [form, setForm] = useState(EMPTY_FORM)
    const [editingId, setEditingId] = useState(null)
    const [error, setError] = useState('')

    function updateThresholds(nextThresholds) {
        setThresholds(nextThresholds)
        saveThresholds(nextThresholds)
    }

    function handleSubmit(event) {
        event.preventDefault()
        const numericValue = Number(form.value)

        if (!Number.isFinite(numericValue) || numericValue < 0 || numericValue > 100) {
            setError('Escribe un valor entre 0 y 100.')
            return
        }

        const threshold = {
            ...form,
            value: numericValue,
            id: editingId ?? `threshold-${Date.now()}`,
        }
        const nextThresholds = editingId
            ? thresholds.map((item) => item.id === editingId ? threshold : item)
            : [...thresholds, threshold]

        updateThresholds(nextThresholds)
        setForm(EMPTY_FORM)
        setEditingId(null)
        setError('')
    }

    function handleEdit(threshold) {
        setForm({
            equipment: threshold.equipment,
            metric: threshold.metric,
            operator: threshold.operator,
            value: String(threshold.value),
            unit: threshold.unit,
        })
        setEditingId(threshold.id)
        setError('')
    }

    function handleDelete(threshold) {
        const confirmed = window.confirm(`¿Eliminar el umbral "${formatThreshold(threshold)}"?`)

        if (!confirmed) {
            return
        }

        updateThresholds(thresholds.filter((item) => item.id !== threshold.id))

        if (editingId === threshold.id) {
            setForm(EMPTY_FORM)
            setEditingId(null)
        }
    }

    function handleCancelEdit() {
        setForm(EMPTY_FORM)
        setEditingId(null)
        setError('')
    }

    return (
        <main className="dashboard-page">
            <section className="dashboard-card alerts-card">
                <header className="dashboard-header">
                    <div>
                        <p className="eyebrow">Sistema Monitor</p>
                        <h1>Alertas</h1>
                        <p className="page-description">Configura los límites que requieren atención en cada equipo.</p>
                    </div>
                    <button type="button" onClick={() => navigate('/home')}>Volver al panel</button>
                </header>

                <section className="alert-form-section" aria-labelledby="threshold-form-title">
                    <h2 id="threshold-form-title">{editingId ? 'Modificar umbral' : 'Crear umbral'}</h2>
                    <form className="threshold-form" onSubmit={handleSubmit}>
                        <div className="threshold-field">
                            <label htmlFor="alert-equipment">Equipo</label>
                            <select
                                id="alert-equipment"
                                value={form.equipment}
                                onChange={(event) => setForm({ ...form, equipment: event.target.value })}
                            >
                                <option>Servidor pendiente de conexión</option>
                            </select>
                        </div>

                        <div className="threshold-field">
                            <label htmlFor="alert-metric">Métrica</label>
                            <select
                                id="alert-metric"
                                value={form.metric}
                                onChange={(event) => setForm({ ...form, metric: event.target.value })}
                            >
                                <option>CPU</option>
                                <option>Memoria RAM</option>
                                <option>Disco</option>
                            </select>
                        </div>

                        <div className="threshold-field">
                            <label htmlFor="alert-operator">Condición</label>
                            <select
                                id="alert-operator"
                                value={form.operator}
                                onChange={(event) => setForm({ ...form, operator: event.target.value })}
                            >
                                <option value="gt">Mayor a</option>
                                <option value="lt">Menor a</option>
                            </select>
                        </div>

                        <div className="threshold-field">
                            <label htmlFor="alert-value">Valor (%)</label>
                            <input
                                id="alert-value"
                                type="number"
                                min="0"
                                max="100"
                                value={form.value}
                                onChange={(event) => setForm({ ...form, value: event.target.value })}
                                required
                            />
                        </div>

                        <div className="threshold-form-actions">
                            <button type="submit">{editingId ? 'Guardar cambios' : 'Agregar umbral'}</button>
                            {editingId && <button type="button" onClick={handleCancelEdit}>Cancelar</button>}
                        </div>
                    </form>
                    {error && <p className="form-error" role="alert">{error}</p>}
                </section>

                <section aria-labelledby="threshold-list-title">
                    <div className="section-heading">
                        <h2 id="threshold-list-title">Umbrales configurados</h2>
                        <span>{thresholds.length} configurados</span>
                    </div>
                    {thresholds.length === 0 ? (
                        <p className="empty-state">Aún no hay umbrales configurados.</p>
                    ) : (
                        <div className="threshold-list">
                            {thresholds.map((threshold) => (
                                <article className="threshold-item" key={threshold.id}>
                                    <div>
                                        <strong>{threshold.metric}</strong>
                                        <p>{formatThreshold(threshold)}</p>
                                    </div>
                                    <div className="threshold-actions">
                                        <button type="button" onClick={() => handleEdit(threshold)}>Modificar</button>
                                        <button type="button" onClick={() => handleDelete(threshold)}>Eliminar</button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </section>
        </main>
    )
}

export default AlertsPage
