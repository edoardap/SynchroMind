import { useRef, type ReactNode } from 'react'
import { Button } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog'

interface ConfirmDialogProps {
  title: string
  children: ReactNode
  confirmLabel: string
  pendingLabel: string
  cancelLabel?: string
  danger?: boolean
  pending?: boolean
  error?: string
  onConfirm: () => void
  onClose: () => void
}

/** Confirmação com o foco inicial em "Cancelar" (a ação segura). */
export function ConfirmDialog({ title, children, confirmLabel, pendingLabel, cancelLabel = 'Cancelar', danger, pending, error, onConfirm, onClose }: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  return (
    <Dialog
      title={title}
      onClose={onClose}
      initialFocusRef={cancelRef}
      actions={
        <>
          <Button ref={cancelRef} variant="outline" onClick={onClose}>{cancelLabel}</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={pending} loadingText={pendingLabel}>{confirmLabel}</Button>
        </>
      }
    >
      {children}
      {error ? <p role="alert" style={{ color: 'var(--cor-erro)', fontWeight: 600 }}>{error}</p> : null}
    </Dialog>
  )
}
