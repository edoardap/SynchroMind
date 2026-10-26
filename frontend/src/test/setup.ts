import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
  try {
    window.sessionStorage.clear()
  } catch {
    /* jsdom sem storage: ignora */
  }
})

// jsdom não implementa scrollTo (usado ao trocar de página).
window.scrollTo = () => undefined
