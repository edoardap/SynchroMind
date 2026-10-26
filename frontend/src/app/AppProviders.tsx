import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import type { DevTools, ForumApi } from '../api'
import { ToastProvider } from '../components/ui/Toast'
import { ApiContext } from './ApiContext'
import { AuthProvider } from './auth'

interface AppProvidersProps {
  api: ForumApi
  devTools?: DevTools
  queryClient: QueryClient
  children: ReactNode
}

/** Dados do servidor (cache), camada de dados, avisos e sessão. O roteador entra por dentro. */
export function AppProviders({ api, devTools, queryClient, children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ApiContext.Provider value={{ api, devTools }}>
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </ApiContext.Provider>
    </QueryClientProvider>
  )
}
