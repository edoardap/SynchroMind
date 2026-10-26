import { QueryCache, QueryClient } from '@tanstack/react-query'
import { isStatus } from '../api'

export const ME_KEY = ['me'] as const

/** 401 em qualquer consulta derruba a sessão na tela: quem usa o app volta para "Entrar". */
export function createQueryClient(): QueryClient {
  const client: QueryClient = new QueryClient({
    queryCache: new QueryCache({
      onError(error, query) {
        if (isStatus(error, 401) && query.queryKey[0] !== 'me') client.setQueryData(ME_KEY, null)
      },
    }),
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false, staleTime: 15_000 },
    },
  })
  return client
}
