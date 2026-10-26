import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { isApiError } from '../../api'
import { useApi } from '../../app/ApiContext'
import { useMe } from '../../app/auth'
import { PendingBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog'
import { Alert, ErrorState, Skeleton } from '../../components/ui/Feedback'
import { Checkbox } from '../../components/ui/Form'
import { Icon } from '../../components/ui/Icon'
import { formatDate } from '../../lib/dates'
import { useDocumentTitle } from '../../lib/hooks'
import styles from './account.module.css'

const KEY = ['my-deletion-request']

function RequestDialog({ onClose }: { onClose: () => void }) {
  const api = useApi()
  const client = useQueryClient()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const [ack, setAck] = useState(false)
  const [ackError, setAckError] = useState<string>()
  const [error, setError] = useState<string>()
  const send = useMutation({
    mutationFn: () => api.requestDeletion({ acknowledged: true }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: KEY })
      onClose()
    },
    onError: (e) => {
      setError(
        isApiError(e, 'deletion_already_requested')
          ? 'Você já tem um pedido de exclusão pendente.'
          : 'Não foi possível enviar o pedido. Tente de novo.',
      )
    },
  })

  function submit() {
    if (!ack) {
      setAckError('Para enviar o pedido, marque que entendeu.')
      return
    }
    setAckError(undefined)
    setError(undefined)
    send.mutate()
  }

  return (
    <Dialog
      title="Pedir a exclusão da sua conta?"
      onClose={onClose}
      initialFocusRef={cancelRef}
      actions={
        <>
          <Button ref={cancelRef} variant="outline" onClick={onClose}>Cancelar</Button>
          <Button variant="danger" onClick={submit} loading={send.isPending} loadingText="Enviando...">Enviar pedido</Button>
        </>
      }
    >
      {error ? <Alert variant="error">{error}</Alert> : null}
      <ul className={styles.steps}>
        <li>Os administradores vão analisar o seu pedido.</li>
        <li>Depois da exclusão, o seu nome e o seu e-mail serão apagados e você não vai mais conseguir entrar.</li>
        <li>
          O que você publicou continua no fórum, <strong>sem o seu nome</strong>. Se algum texto seu tiver dados pessoais, edite-o antes ou peça a um administrador para ocultá-lo.
        </li>
      </ul>
      <Checkbox
        label="Entendi que o que publiquei continua no fórum, sem o meu nome."
        checked={ack}
        error={ackError}
        onChange={(e) => setAck(e.target.checked)}
      />
    </Dialog>
  )
}

/** B10: minha conta (nome e e-mail só para leitura) e pedido de exclusão (HU-04). */
export function AccountPage() {
  useDocumentTitle('Minha conta')
  const api = useApi()
  const me = useMe()
  const [open, setOpen] = useState(false)
  const request = useQuery({ queryKey: KEY, queryFn: () => api.getMyDeletionRequest() })

  return (
    <div className={styles.page}>
      <h1>Minha conta</h1>
      <dl className={styles.data}>
        <div><dt className="rotulo">Nome</dt><dd>{me.name}</dd></div>
        <div><dt className="rotulo">E-mail</dt><dd>{me.email}</dd></div>
      </dl>
      <section className={styles.danger} aria-labelledby="excluir">
        <p id="excluir" className={`rotulo ${styles.dangerLabel}`}><Icon name="alert" size={16} /> Excluir minha conta</p>
        {request.isPending ? (
          <Skeleton height={44} width={240} />
        ) : request.isError ? (
          <ErrorState message="Não foi possível carregar o seu pedido." onRetry={() => void request.refetch()} />
        ) : request.data ? (
          <div className={styles.pending}>
            <PendingBadge />
            <p>Enviado em {formatDate(request.data.requested_at)}. Os administradores ainda vão analisar.</p>
          </div>
        ) : (
          <>
            <p>Você pode pedir a exclusão da sua conta. Os administradores analisam o pedido.</p>
            <div>
              <Button variant="outline" onClick={() => setOpen(true)}>Pedir exclusão da conta</Button>
            </div>
          </>
        )}
      </section>
      {open ? <RequestDialog onClose={() => setOpen(false)} /> : null}
    </div>
  )
}
