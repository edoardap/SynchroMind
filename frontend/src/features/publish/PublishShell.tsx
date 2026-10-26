import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useBlocker, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog'
import { Alert } from '../../components/ui/Feedback'
import { ErrorSummary, type ErrorSummaryItem } from '../../components/ui/Form'
import { useDocumentTitle } from '../../lib/hooks'
import styles from './publish.module.css'

interface PublishShellProps {
  title: string
  submitLabel: string
  pendingLabel: string
  /** Há texto digitado: Cancelar e o botão Voltar pedem confirmação. */
  dirty: boolean
  pending: boolean
  serverError: boolean
  errors: ErrorSummaryItem[]
  disableSubmit?: boolean
  disableHint?: string
  onSubmit: () => void
  children: ReactNode
  aside?: ReactNode
}

/** Casca comum de B2, B3 e B4: título, resumo de erros, aviso de conteúdo, ações e confirmação de descarte. */
export function PublishShell({
  title, submitLabel, pendingLabel, dirty, pending, serverError, errors, disableSubmit, disableHint,
  onSubmit, children, aside,
}: PublishShellProps) {
  useDocumentTitle(title)
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const dirtyRef = useRef(dirty)
  useEffect(() => {
    dirtyRef.current = dirty
  })

  // Voltar do navegador e links também pedem confirmação, exceto a navegação marcada com bypassGuard
  // (depois de publicar ou de descartar).
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirtyRef.current &&
      currentLocation.pathname !== nextLocation.pathname &&
      (nextLocation.state as { bypassGuard?: boolean } | null)?.bypassGuard !== true,
  )
  const confirming = confirmOpen || blocker.state === 'blocked'

  function cancel() {
    if (dirty) setConfirmOpen(true)
    else navigate('/')
  }

  function keepEditing() {
    setConfirmOpen(false)
    if (blocker.state === 'blocked') blocker.reset()
  }

  function discard() {
    setConfirmOpen(false)
    if (blocker.state === 'blocked') blocker.proceed()
    else navigate('/', { state: { bypassGuard: true } })
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{title}</h1>
      <form className={styles.form} onSubmit={submit} noValidate>
        <ErrorSummary items={errors} />
        {serverError ? <Alert variant="error">Não foi possível publicar. O texto continua aqui. Tente de novo.</Alert> : null}
        {children}
        <Alert variant="info">
          Este post fica visível para toda a empresa. Não inclua senhas, chaves de acesso, dados de clientes nem informações confidenciais.
        </Alert>
        <div className={styles.actions}>
          <Button type="submit" size="lg" loading={pending} loadingText={pendingLabel} disabled={disableSubmit}>{submitLabel}</Button>
          <Button variant="outline" size="lg" onClick={cancel}>Cancelar</Button>
          {disableSubmit && disableHint ? <p className="meta">{disableHint}</p> : null}
        </div>
      </form>
      {aside}
      {confirming ? (
        <Dialog
          title="Descartar o que você escreveu?"
          onClose={keepEditing}
          actions={
            <>
              <Button variant="outline" onClick={keepEditing}>Continuar editando</Button>
              <Button variant="danger" onClick={discard}>Descartar</Button>
            </>
          }
        >
          <p>O que você digitou até aqui não será guardado.</p>
        </Dialog>
      ) : null}
    </div>
  )
}
