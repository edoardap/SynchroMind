import { useEffect, useId, useRef, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './Button'
import { Icon } from './Icon'
import styles from './Dialog.module.css'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

interface DialogProps {
  title: string
  onClose: () => void
  children: ReactNode
  /** Rodapé com os botões. */
  actions?: ReactNode
  /** Elemento que recebe o foco ao abrir (ação segura, nas confirmações). Padrão: o primeiro campo ou botão. */
  initialFocusRef?: RefObject<HTMLElement | null>
  /** Em vez de janela centrada, abre como folha inferior em qualquer largura (menus do celular). */
  sheet?: boolean
}

/**
 * Janela: foco preso, Esc fecha e devolve o foco a quem abriu, fundo escurecido.
 * No celular vira folha inferior de largura total (CSS).
 */
export function Dialog({ title, onClose, children, actions, initialFocusRef, sheet }: DialogProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const panel = panelRef.current
    const target =
      initialFocusRef?.current ??
      panel?.querySelector<HTMLElement>('input:not([disabled]), textarea:not([disabled]), select:not([disabled])') ??
      panel?.querySelector<HTMLElement>(FOCUSABLE)
    target?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
      if (opener && document.contains(opener)) opener.focus()
    }
  }, [initialFocusRef])

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onCloseRef.current()
      return
    }
    if (event.key !== 'Tab') return
    const nodes = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE)
    if (!nodes || nodes.length === 0) return
    const first = nodes[0] as HTMLElement
    const last = nodes[nodes.length - 1] as HTMLElement
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  /* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-element-interactions -- o fundo só fecha com o mouse; o teclado fecha com Esc (tratado no painel) */
  return createPortal(
    <div className={[styles.overlay, sheet ? styles.sheetOnly : ''].filter(Boolean).join(' ')} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={styles.panel}
        onKeyDown={onKeyDown}
      >
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>{title}</h2>
          <Button variant="text" onClick={onClose} aria-label="Fechar" className={styles.close}>
            <Icon name="close" size={20} />
          </Button>
        </div>
        <div className={styles.body}>{children}</div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
    </div>,
    document.body,
  )
  /* eslint-enable jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-element-interactions */
}
