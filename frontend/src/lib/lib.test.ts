import { formatRelative } from './dates'
import { initials, isValidTag, makeExcerpt, normalizeText, slugifyTag, splitByTerms } from './text'
import { validateEmail } from './validation'

describe('texto', () => {
  it('normaliza acento e maiúscula', () => {
    expect(normalizeText('SoluÇão Ágil')).toBe('solucao agil')
  })

  it('transforma texto em tag: minúsculas, sem acento, hifenizada', () => {
    expect(slugifyTag('  #Meu Assunto ')).toBe('meu-assunto')
    expect(slugifyTag('Synchro4me')).toBe('synchro4me')
    expect(isValidTag('meu-assunto')).toBe(true)
    expect(isValidTag('a_b')).toBe(false)
    expect(isValidTag('-x')).toBe(false)
  })

  it('resume o texto em uma linha com reticências', () => {
    expect(makeExcerpt('a   b\nc', 10)).toBe('a b c')
    expect(makeExcerpt('x'.repeat(30), 10)).toBe(`${'x'.repeat(9)}…`)
  })

  it('tira as iniciais do nome', () => {
    expect(initials('Marina Souza')).toBe('MS')
    expect(initials('Cher')).toBe('C')
  })

  it('marca os termos achados sem diferenciar acento (realce da busca)', () => {
    expect(splitByTerms('Solução rápida', ['SOLUCAO'])).toEqual([
      { text: 'Solução', match: true },
      { text: ' rápida', match: false },
    ])
    expect(splitByTerms('abc', [])).toEqual([{ text: 'abc', match: false }])
  })
})

describe('datas', () => {
  const now = Date.parse('2026-10-26T12:00:00Z')
  it.each([
    ['2026-10-26T11:59:40Z', 'há instantes'],
    ['2026-10-26T11:00:00Z', 'há 1 hora'],
    ['2026-10-24T12:00:00Z', 'há 2 dias'],
    ['2026-08-20T12:00:00Z', 'há 2 meses'],
  ])('%s vira "%s"', (iso, expected) => {
    expect(formatRelative(iso, now)).toBe(expected)
  })
})

describe('validação de e-mail', () => {
  it('cobre vazio, formato e domínio', () => {
    expect(validateEmail('')).toBe('Informe o seu e-mail.')
    expect(validateEmail('ana@')).toMatch(/parece incompleto/)
    expect(validateEmail('ana@gmail.com', true)).toMatch(/@empresa\.com\.br/)
    expect(validateEmail('Ana@Empresa.com.br', true)).toBeNull()
  })
})
