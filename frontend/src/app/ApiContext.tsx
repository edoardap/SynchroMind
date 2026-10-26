import { createContext, useContext } from 'react'
import type { DevTools, ForumApi } from '../api'

export interface ApiContextValue {
  api: ForumApi
  devTools?: DevTools
}

export const ApiContext = createContext<ApiContextValue | null>(null)

export function useApi(): ForumApi {
  const value = useContext(ApiContext)
  if (!value) throw new Error('useApi fora do ApiContext')
  return value.api
}

export function useDevTools(): DevTools | undefined {
  return useContext(ApiContext)?.devTools
}
