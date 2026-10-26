import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { DevProfileSwitch } from '../layout/DevProfileSwitch'

/** Em cada mudança de página: volta ao topo e leva o foco ao conteúdo (leitor de tela e teclado). */
function RouteFocus() {
  const { pathname, state } = useLocation()
  const first = useRef(true)
  const keepFocus = (state as { keepFocus?: boolean } | null)?.keepFocus === true
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (keepFocus) return
    window.scrollTo?.(0, 0)
    document.getElementById('conteudo')?.focus({ preventScroll: true })
    // Só a mudança de página move o foco; trocar de aba (keepFocus) não.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])
  return null
}

export function RootLayout() {
  return (
    <>
      <RouteFocus />
      <Outlet />
      <DevProfileSwitch />
    </>
  )
}
