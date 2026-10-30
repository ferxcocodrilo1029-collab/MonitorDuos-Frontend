import { request } from './api'

/**
 * Obtiene las métricas en tiempo real y registra la lectura en la base de datos
 */
export async function getLiveMetrics(signal) {
  return request('index.php?action=live', { signal })
}

/**
 * Consulta el historial de métricas registradas en un rango de fechas
 */
export async function getHistoryMetrics(inicio, fin, signal) {
  const params = new URLSearchParams({
    action: 'history',
    inicio,
    fin,
  })

  const response = await request(`index.php?${params.toString()}`, { signal })
  const records = response.datos || []

  let avgCpu = 0
  let avgRam = 0
  let avgDisco = 0

  if (records.length > 0) {
    const sumCpu = records.reduce((acc, r) => acc + Number(r.cpu_uso || 0), 0)
    const sumRam = records.reduce((acc, r) => acc + Number(r.ram_uso || 0), 0)
    const sumDisco = records.reduce((acc, r) => acc + Number(r.disco_uso || 0), 0)

    avgCpu = Number((sumCpu / records.length).toFixed(1))
    avgRam = Number((sumRam / records.length).toFixed(1))
    avgDisco = Number((sumDisco / records.length).toFixed(1))
  }

  return {
    equipo: response.equipo || 'Servidor Monitoreado',
    total: records.length,
    avgCpu,
    avgRam,
    avgDisco,
    records,
  }
}

