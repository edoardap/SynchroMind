export interface ApiErrorDetail {
  field: string
  code: string
  message: string
}

/** Erro no formato único da API: {"error": {"code", "message", "details"}} com status HTTP. */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details: ApiErrorDetail[]

  constructor(status: number, code: string, message: string, details: ApiErrorDetail[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export function isApiError(error: unknown, code?: string): error is ApiError {
  return error instanceof ApiError && (code === undefined || error.code === code)
}

export function isStatus(error: unknown, status: number): error is ApiError {
  return error instanceof ApiError && error.status === status
}
