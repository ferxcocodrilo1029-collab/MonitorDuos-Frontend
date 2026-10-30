const THRESHOLDS_STORAGE_KEY = 'monitorduo.thresholds'

export const DEFAULT_THRESHOLDS = [
    { id: 'cpu-default', equipment: 'Todos los equipos', metric: 'CPU', operator: 'gt', value: 80, unit: '%' },
    { id: 'memory-default', equipment: 'Todos los equipos', metric: 'Memoria RAM', operator: 'gt', value: 85, unit: '%' },
]

export function getThresholds() {
    const storedThresholds = window.localStorage.getItem(THRESHOLDS_STORAGE_KEY)

    if (!storedThresholds) {
        return DEFAULT_THRESHOLDS
    }

    try {
        return JSON.parse(storedThresholds)
    } catch {
        return DEFAULT_THRESHOLDS
    }
}

export function saveThresholds(thresholds) {
    window.localStorage.setItem(THRESHOLDS_STORAGE_KEY, JSON.stringify(thresholds))
}

export function isThresholdExceeded(threshold, currentValue) {
    if (currentValue === null || currentValue === undefined || Number.isNaN(currentValue)) {
        return false
    }

    return threshold.operator === 'gt'
        ? currentValue > threshold.value
        : currentValue < threshold.value
}
