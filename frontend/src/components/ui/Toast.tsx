import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Button } from './Button'
import { Icon } from './Icon'
import styles from './Toast.module.css'

export interface ToastInput {
  message: string
  variant?: 'success' | 'error' | 'info'
  /** Ação opcional (ex.: "Desfazer"). */
  action?: { label: string; onClick: () => void }
  /** Padrão 5 s; "Restaurado" usa 8 s. */
  durationMs?: number
}

interface ToastItem extends ToastInput {
  id: number
}

interface ToastContextValue {
  show: (toast: ToastInput) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const value = useContext(ToastContext)
  if (!value) throw new Error('useToast fora do ToastProvider')
  return value
}

/** Avisos de confirmação no canto inferior, em região aria-live="polite". Não é o único canal para erro. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => setItems((current) => current.filter((t) => t.id !== id)), [])
  const show = useCallback(
    (toast: ToastInput) => {
      const id = nextId.current++
      setItems((current) => [...current, { ...toast, id }])
    },
    [],
  )
  const value = useMemo(() => ({ show }), [show])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.region} aria-live="polite" aria-atomic="false">
        {items.map((item) => (
          <ToastView key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastView({ item, onDismiss }: { item: ToastItem; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(item.id), item.durationMs ?? 5000)
    return () => clearTimeout(timer)
  }, [item.id, item.durationMs, onDismiss])

  return (
    <div className={[styles.toast, item.variant === 'error' ? styles.error : ''].filter(Boolean).join(' ')}>
      <Icon name={item.variant === 'error' ? 'alert' : item.variant === 'info' ? 'info' : 'check'} size={18} />
      <span className={styles.message}>{item.message}</span>
      {item.action ? (
        <Button
          variant="text"
          className={styles.action}
          onClick={() => {
            item.action?.onClick()
            onDismiss(item.id)
          }}
        >
          {item.action.label}
        </Button>
      ) : null}
      <Button variant="text" className={styles.action} onClick={() => onDismiss(item.id)} aria-label="Fechar aviso">
        <Icon name="close" size={16} />
      </Button>
    </div>
  )
}
