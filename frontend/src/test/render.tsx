import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import type { DevProfile, ForumApi } from '../api'
import { createMemoryApi, type MemoryApiOptions } from '../api/memory/memoryApi'
import { AppProviders } from '../app/AppProviders'
import { createQueryClient } from '../app/queryClient'
import { routes } from '../app/routes'

interface RenderAppOptions {
  route?: string
  profile?: DevProfile
  /** Substitui métodos da camada de dados (para simular erro, atraso ou resposta específica). */
  overrides?: Partial<ForumApi>
  seed?: MemoryApiOptions['seed']
}

/** Renderiza o app inteiro (rotas, sessão, cache) sobre a camada em memória, sem atraso. */
export function renderApp({ route = '/', profile = 'user', overrides, seed }: RenderAppOptions = {}) {
  const memory = createMemoryApi({ delayMs: 0, profile, storage: null, seed })
  const api: ForumApi = { ...memory, ...overrides }
  const queryClient = createQueryClient()
  const router = createMemoryRouter(routes, { initialEntries: [route] })
  const user = userEvent.setup()
  const utils = render(
    <AppProviders api={api} devTools={memory.dev} queryClient={queryClient}>
      <RouterProvider router={router} />
    </AppProviders>,
  )
  return { user, router, memory, api, queryClient, ...utils }
}
