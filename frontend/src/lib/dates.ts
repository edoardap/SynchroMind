const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/** "há 2 dias", "há instantes". Receber `now` deixa o resultado testável. */
export function formatRelative(iso: string, now: number = Date.now()): string {
  const diff = Math.max(0, now - new Date(iso).getTime())
  if (diff < MINUTE) return 'há instantes'
  if (diff < HOUR) {
    const n = Math.floor(diff / MINUTE)
    return `há ${n} ${n === 1 ? 'minuto' : 'minutos'}`
  }
  if (diff < DAY) {
    const n = Math.floor(diff / HOUR)
    return `há ${n} ${n === 1 ? 'hora' : 'horas'}`
  }
  if (diff < 30 * DAY) {
    const n = Math.floor(diff / DAY)
    return `há ${n} ${n === 1 ? 'dia' : 'dias'}`
  }
  if (diff < 365 * DAY) {
    const n = Math.floor(diff / (30 * DAY))
    return `há ${n} ${n === 1 ? 'mês' : 'meses'}`
  }
  const n = Math.floor(diff / (365 * DAY))
  return `há ${n} ${n === 1 ? 'ano' : 'anos'}`
}

/** "12/11/2026" */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' }).format(new Date(iso))
}

/** "20/11" */
export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' }).format(
    new Date(iso),
  )
}
