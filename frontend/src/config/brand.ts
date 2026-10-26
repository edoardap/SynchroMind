/**
 * Nome provisório do produto (docs/design, P-02). É o único lugar a trocar:
 * cabeçalho, título da página, texto alternativo da marca e telas de acesso leem daqui.
 */
export const APP_NAME = 'SynchroMind'
export const APP_INITIAL = 'S'

/** Domínio de e-mail aceito no cadastro (P-03). Quem valida de verdade é o backend (ALLOWED_EMAIL_DOMAINS). */
export const EMAIL_DOMAIN = 'empresa.com.br'

/** Limites a definir (HU-06, HU-11). Viram configuração do backend; aqui valem como espelho. */
export const LIMITS = {
  maxTags: 5,
  maxText: 5000,
  maxReportDetails: 300,
  pageSize: 20,
} as const
