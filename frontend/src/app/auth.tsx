import { useQuery, type QueryObserverResult } from '@tanstack/react-query'
import { createContext, useContext, useState, type ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { isStatus, type Me } from '../api'
import { Skeleton } from '../components/ui/Feedback'
import { AuthLayout } from '../layout/AuthLayout'
import { AppLayout } from '../layout/AppLayout'
import { ErrorState } from '../components/ui/Feedback'
import { BlockedPage } from '../features/auth/BlockedPage'
import { PermissionDenied } from '../features/states/PermissionDenied'
import { useApi } from './ApiContext'
import { ME_KEY } from './queryClient'

interface AuthValue {
  me: Me | null
  isLoading: boolean
  isError: boolean
  refetch: () => Promise<QueryObserverResult<Me | null>>
  /** Já houve sessão nesta aba: se ela cair, a mensagem é "Sua sessão acabou". */
  hadSession: boolean
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const api = useApi()
  const [hadSession, setHadSession] = useState(false)
  const query = useQuery({
    queryKey: ME_KEY,
    queryFn: async (): Promise<Me | null> => {
      try {
        return await api.getMe()
      } catch (error) {
        if (isStatus(error, 401)) return null
        throw error
      }
    },
    staleTime: Infinity,
  })
  const me = query.data ?? null
  if (me && !hadSession) setHadSession(true)
  return (
    <AuthContext.Provider
      value={{ me, isLoading: query.isPending, isError: query.isError, refetch: query.refetch, hadSession }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth fora do AuthProvider')
  return value
}

/** Pessoa logada. Só vale dentro das rotas protegidas. */
export function useMe(): Me {
  const { me } = useAuth()
  if (!me) throw new Error('useMe fora de rota protegida')
  return me
}

/** Rotas com sessão (RNF-01): sem sessão vai para "Entrar"; sem e-mail confirmado vê "Acesso bloqueado". */
export function RequireSession() {
  const { me, isLoading, isError, refetch, hadSession } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <AuthLayout>
        <div role="status" aria-label="Carregando...">
          <Skeleton height={28} width={220} />
        </div>
      </AuthLayout>
    )
  }
  if (isError) {
    return (
      <AuthLayout>
        <ErrorState message="Não foi possível carregar esta página." onRetry={() => void refetch()} headingLevel={1} />
      </AuthLayout>
    )
  }
  if (!me) {
    return <Navigate to="/entrar" replace state={{ from: location.pathname + location.search, expired: hadSession }} />
  }
  if (!me.email_confirmed_at) {
    return (
      <AuthLayout>
        <BlockedPage email={me.email} />
      </AuthLayout>
    )
  }
  return (
    <AppLayout me={me}>
      <Outlet />
    </AppLayout>
  )
}

/** Rotas de administração: quem não é admin vê "Sem permissão" (a decisão final é do servidor). */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const me = useMe()
  if (me.role !== 'admin') return <PermissionDenied />
  return children
}
