import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    getThresholds,
    saveThresholds,
} from '../services/thresholdStorage'

const EMPTY_FORM = {
    name: '',
    equipment: 'Todos los equipos',
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

        if (!form.name.trim()) {
            setError('Escribe un nombre para la alerta.')
            return
        }

        if (!Number.isFinite(numericValue) || numericValue < 0 || numericValue > 100) {
            setError('Escribe un valor entre 0 y 100.')
            return
        }

        const threshold = {
            ...form,
            name: form.name.trim(),
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
            name: threshold.name ?? threshold.metric,
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
        <main className={`dashboard-page alerts-page${editingId ? ' is-editing' : ''}`}>
            <section className={`dashboard-card alerts-card${editingId ? ' edit-alert-card' : ''}`}>
                <header className="dashboard-header">
                    <div>
                        <p className="eyebrow">{editingId ? 'Editar alerta' : 'Sistema Monitor'}</p>
                        <h1>{editingId ? form.name || form.metric : 'Alertas'}</h1>
                        <p className="page-description">
                            {editingId
                                ? 'Actualiza las condiciones de esta alerta.'
                                : 'Configura los límites que requieren atención en cada equipo.'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={editingId ? handleCancelEdit : () => navigate('/home')}
                    >
                        {editingId ? 'Volver a alertas' : 'Volver al panel'}
                    </button>
                </header>

                {!editingId && (
                    <section className="alert-form-section" aria-labelledby="threshold-form-title">
                    <h2 id="threshold-form-title">Crear alerta</h2>
                    <form className="threshold-form" onSubmit={handleSubmit}>
                        <div className="threshold-field">
                            <label htmlFor="alert-name">Nombre de la alerta</label>
                            <input
                                id="alert-name"
                                type="text"
                                value={form.name}
                                onChange={(event) => setForm({ ...form, name: event.target.value })}
                                placeholder="Ej. Alerta CPU alto"
                                required
                            />
                        </div>
                        <div className="threshold-field">
                            <label htmlFor="alert-equipment">Equipo</label>
                            <select
                                id="alert-equipment"
                                value={form.equipment}
                                onChange={(event) => setForm({ ...form, equipment: event.target.value })}
                            >
                                <option value="Todos los equipos">Todos los equipos</option>
                                <option value="Servidor Local">Servidor Local</option>
                            </select>
                        </div>

                        <div className="threshold-field">
                            <label htmlFor="alert-metric">Métrica</label>
                            <select
                                id="alert-metric"
                                value={form.metric}
                                onChange={(event) => setForm({ ...form, metric: event.target.value })}
                            >
                                <option value="CPU">CPU</option>
                                <option value="Memoria RAM">Memoria RAM</option>
                                <option value="Disco">Disco</option>
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
                            <button type="submit">Agregar alerta</button>
                        </div>
                    </form>
                    {error && <p className="form-error" role="alert">{error}</p>}
                    </section>
                )}

                {editingId && (
                    <section className="alert-form-section threshold-edit-page" aria-labelledby="edit-threshold-title">
                        <h2 id="edit-threshold-title">Configuración de alerta</h2>
                        <form className="threshold-edit-form" onSubmit={handleSubmit}>
                                <div className="threshold-field">
                                    <label htmlFor="edit-alert-name">Nombre de la alerta</label>
                                    <input
                                        id="edit-alert-name"
                                        type="text"
                                        value={form.name}
                                        onChange={(event) => setForm({ ...form, name: event.target.value })}
                                        required
                                    />
                                </div>
                                <div className="threshold-field">
                                    <label htmlFor="edit-alert-equipment">Equipo</label>
                                    <select
                                        id="edit-alert-equipment"
                                        value={form.equipment}
                                        onChange={(event) => setForm({ ...form, equipment: event.target.value })}
                                    >
                                        <option value="Todos los equipos">Todos los equipos</option>
                                        <option value="Servidor Local">Servidor Local</option>
                                    </select>
                                </div>
                                <div className="threshold-field">
                                    <label htmlFor="edit-alert-metric">Métrica</label>
                                    <select
                                        id="edit-alert-metric"
                                        value={form.metric}
                                        onChange={(event) => setForm({ ...form, metric: event.target.value })}
                                    >
                                        <option value="CPU">CPU</option>
                                        <option value="Memoria RAM">Memoria RAM</option>
                                        <option value="Disco">Disco</option>
                                    </select>
                                </div>
                                <div className="threshold-field">
                                    <label htmlFor="edit-alert-operator">Condición</label>
                                    <select
                                        id="edit-alert-operator"
                                        value={form.operator}
                                        onChange={(event) => setForm({ ...form, operator: event.target.value })}
                                    >
                                        <option value="gt">Mayor a</option>
                                        <option value="lt">Menor a</option>
                                    </select>
                                </div>
                                <div className="threshold-field">
                                    <label htmlFor="edit-alert-value">Valor (%)</label>
                                    <input
                                        id="edit-alert-value"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={form.value}
                                        onChange={(event) => setForm({ ...form, value: event.target.value })}
                                        required
                                    />
                                </div>
                                <div className="threshold-form-actions">
                                    <button type="submit">Guardar cambios</button>
                                    <button type="button" onClick={handleCancelEdit}>Cancelar</button>
                                </div>
                        </form>
                        {error && <p className="form-error" role="alert">{error}</p>}
                    </section>
                )}

                {!editingId && <section aria-labelledby="threshold-list-title">
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
                                        <strong>{threshold.name || threshold.metric}</strong>
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
                </section>}
            </section>
        </main>
    )
}

export default AlertsPage
