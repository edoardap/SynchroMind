import { EMAIL_DOMAIN } from '../config/brand'
import type { ApiError } from '../api'

export type FieldErrors = Record<string, string>

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Mensagem de erro do e-mail, ou null se estiver bom. `checkDomain` vale só no cadastro (HU-01). */
export function validateEmail(value: string, checkDomain = false): string | null {
  const email = value.trim().toLowerCase()
  if (!email) return 'Informe o seu e-mail.'
  if (!EMAIL_SHAPE.test(email)) return `Esse e-mail parece incompleto. Exemplo: nome@${EMAIL_DOMAIN}.`
  if (checkDomain && !email.endsWith(`@${EMAIL_DOMAIN}`)) {
    return `Só e-mails da empresa são aceitos. Use um e-mail que termine com @${EMAIL_DOMAIN}.`
  }
  return null
}

/** Converte os `details` de um erro 422 em mensagens por campo. */
export function fieldErrorsFrom(error: ApiError): FieldErrors {
  const result: FieldErrors = {}
  for (const detail of error.details) {
    if (!result[detail.field]) result[detail.field] = detail.message
  }
  return result
}
