import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { isApiError, type DeletionRequest, type DeletionStatus } from '../../api'
import { useApi } from '../../app/ApiContext'
import { Button } from '../../components/ui/Button'
import { ErrorState, SkeletonList, StateBlock } from '../../components/ui/Feedback'
import { FilterToggle } from '../../components/ui/FilterToggle'
import { Icon } from '../../components/ui/Icon'
import { formatDate } from '../../lib/dates'
import { ConfirmDialog } from '../detail/ConfirmDialog'
import styles from './admin.module.css'

export const DELETIONS_KEY = (status: DeletionStatus) => ['admin', 'deletions', status] as const

function DeletionRow({ request }: { request: DeletionRequest }) {
  const api = useApi()
  const client = useQueryClient()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string>()
  const approve = useMutation({
    mutationFn: () => api.approveDeletion(request.id),
    onSuccess: async () => {
      setOpen(false)
      // A conta some e o conteúdo perde o nome do autor: listas e detalhes precisam recarregar.
      await client.invalidateQueries()
    },
    onError: (e) =>
      setError(
        isApiError(e, 'last_admin')
          ? 'Esta é a última pessoa administradora, por isso a conta não pode ser excluída.'
          : 'Não foi possível excluir a conta. Tente de novo.',
      ),
  })
  const user = request.user

  return (
    <li className={styles.row}>
      <div className={styles.rowMain}>
        {user ? (
          <>
            <h3 className={styles.rowTitle}>{user.name}</h3>
            <p className="meta">{user.email}</p>
            <p className="meta">Pedido em {formatDate(request.requested_at)}</p>
            {user.is_admin ? <p className={styles.warn}><Icon name="alert" size={16} /> Esta pessoa é administradora.</p> : null}
          </>
        ) : (
          <>
            <h3 className={styles.rowTitle}>Conta excluída</h3>
            <p className="meta">
              Pedido em {formatDate(request.requested_at)}
              {request.completed_at ? ` · excluída em ${formatDate(request.completed_at)}` : ''}
            </p>
          </>
        )}
      </div>
      {request.status === 'pending' && user ? (
        <div className={styles.rowActions}>
          <Button variant="danger" onClick={() => { setError(undefined); setOpen(true) }} aria-label={`Excluir conta de ${user.name}`}>
            Excluir conta
          </Button>
        </div>
      ) : null}
      {open && user ? (
        <ConfirmDialog
          title={`Excluir a conta de ${user.name}?`}
          confirmLabel="Excluir conta"
          pendingLabel="Excluindo..."
          danger
          pending={approve.isPending}
          error={error}
          onConfirm={() => approve.mutate()}
          onClose={() => setOpen(false)}
        >
          <p>O nome e o e-mail serão apagados e a pessoa não poderá mais entrar. Os posts, perguntas e respostas continuam no fórum, sem o nome dela. Esta ação não pode ser desfeita.</p>
        </ConfirmDialog>
      ) : null}
    </li>
  )
}

/** Aba Pedidos de exclusão (HU-05): concluídos mostram só "Conta excluída" e as datas, sem dados pessoais. */
export function DeletionsTab() {
  const api = useApi()
  const [status, setStatus] = useState<DeletionStatus>('pending')
  const query = useQuery({ queryKey: DELETIONS_KEY(status), queryFn: () => api.listDeletionRequests(status) })

  return (
    <div className={styles.tab}>
      <FilterToggle
        legend="Mostrar pedidos"
        options={[{ value: 'pending', label: 'Pendentes' }, { value: 'done', label: 'Concluídos' }]}
        value={status}
        onChange={setStatus}
      />
      {query.isPending ? (
        <SkeletonList rows={2} />
      ) : query.isError ? (
        <ErrorState message="Não foi possível carregar os pedidos de exclusão." onRetry={() => void query.refetch()} retrying={query.isRefetching} />
      ) : query.data.length === 0 ? (
        <StateBlock icon="checkCircle" title={status === 'pending' ? 'Nenhum pedido pendente.' : 'Nenhum pedido concluído.'} />
      ) : (
        <ul className={styles.list} aria-label="Pedidos de exclusão">
          {query.data.map((request) => <DeletionRow key={request.id} request={request} />)}
        </ul>
      )}
    </div>
  )
}
