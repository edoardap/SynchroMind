import type { ReactNode } from 'react'
import { Brand } from './Brand'
import styles from './AuthLayout.module.css'

/** Casca das telas sem sessão: só a marca e um cartão centralizado (A1 a A5). */
export function AuthLayout({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Brand />
      </header>
      <main id="conteudo" tabIndex={-1} className={styles.main}>
        <div className={[styles.card, wide ? styles.wide : ''].filter(Boolean).join(' ')}>{children}</div>
      </main>
    </div>
  )
}
