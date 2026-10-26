/** Minúsculas e sem acento: a busca e o realce ignoram os dois (HU-10, critério 2). */
export function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

/** Formato de tag sugerido: minúsculas, letras, números e hífen (HU-11, a definir). */
export const TAG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function slugifyTag(value: string): string {
  return normalizeText(value)
    .trim()
    .replace(/^#/, '')
    .replace(/\s+/g, '-')
}

export function isValidTag(value: string): boolean {
  return TAG_PATTERN.test(value)
}

export function makeExcerpt(text: string, max = 160): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length <= max ? flat : `${flat.slice(0, max - 1).trimEnd()}…`
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase()
}

export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`
}

/** Divide o texto em trechos, marcando os que casam com algum termo (sem diferenciar acento e maiúscula). */
export function splitByTerms(text: string, terms: string[]): { text: string; match: boolean }[] {
  const wanted = terms.map(normalizeText).filter((t) => t.length > 1)
  if (wanted.length === 0) return [{ text, match: false }]
  const flags = new Array<boolean>(text.length).fill(false)
  // normalizeText pode mudar o comprimento em casos raros; NFD sem marcas mantém o tamanho para o português.
  const folded = normalizeText(text)
  if (folded.length !== text.length) return [{ text, match: false }]
  for (const term of wanted) {
    let from = 0
    for (;;) {
      const at = folded.indexOf(term, from)
      if (at === -1) break
      for (let i = at; i < at + term.length; i += 1) flags[i] = true
      from = at + term.length
    }
  }
  const parts: { text: string; match: boolean }[] = []
  let start = 0
  for (let i = 1; i <= text.length; i += 1) {
    if (i === text.length || flags[i] !== flags[start]) {
      parts.push({ text: text.slice(start, i), match: flags[start] ?? false })
      start = i
    }
  }
  return parts
}
