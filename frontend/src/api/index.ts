/**
 * Ponto único de escolha da camada de dados.
 *
 * Hoje: implementação em memória com dados de exemplo (o backend ainda não existe).
 * Para usar a API real: crie um objeto que satisfaça `ForumApi` (client.ts), exporte-o como `api`
 * aqui e apague `devTools` (o controle de perfil de teste some junto). Nenhuma tela muda.
 */
import type { DevTools, ForumApi } from './client'
import { createMemoryApi } from './memory/memoryApi'

const memory = createMemoryApi()

export const api: ForumApi = memory
export const devTools: DevTools | undefined = memory.dev

export type { ForumApi, DevProfile, DevTools } from './client'
export { ApiError, isApiError, isStatus } from './errors'
export * from './types'
