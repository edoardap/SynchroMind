import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { isApiError, type AdminUser } from '../../api'
import { useApi } from '../../app/ApiContext'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Combobox } from '../../components/ui/Combobox'
import { Dialog } from '../../components/ui/Dialog'
import { Alert, ErrorState, SkeletonList } from '../../components/ui/Feedback'
import { useToast } from '../../components/ui/Toast'
import { formatDate } from '../../lib/dates'
import { useDebounced } from '../../lib/useDebounced'
import styles from './admin.module.css'

const ADMINS_KEY = ['admin', 'users', 'admins'] as const

function PromoteDialog({ onClose }: { onClose: () => void }) {
  const api = useApi()
  const client = useQueryClient()
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<AdminUser | null>(null)
  const [error, setError] = useState<string>()
  const term = useDebounced(query.trim(), 200)
  const results = useQuery({
    queryKey: ['admin', 'users', 'search', term],
    queryFn: () => api.listUsers({ q: term }),
    enabled: term.length > 0 && !selected,
  })

  const promote = useMutation({
    mutationFn: (user: AdminUser) => api.promoteUser(user.id),
    onSuccess: async (user) => {
      await client.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.show({ message: `${user.name} agora é administrador.` })
      onClose()
    },
    onError: (e) => setError(isApiError(e, 'already_admin') ? 'Essa pessoa já é administradora.' : 'Não foi possível promover. Tente de novo.'),
  })

  function pick(user: AdminUser | null) {
    setSelected(user)
    setError(user?.role === 'admin' ? 'Essa pessoa já é administradora.' : undefined)
  }

  function submit() {
    if (!selected) {
      setError('Escolha uma pessoa.')
      return
    }
    if (selected.role === 'admin') return
    setError(undefined)
    promote.mutate(selected)
  }

  return (
    <Dialog
      title="Promover alguém a administrador"
      onClose={onClose}
      actions={
        <>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={submit} loading={promote.isPending} loadingText="Promovendo...">Promover</Button>
        </>
      }
    >
      <Combobox<AdminUser>
        label="Nome ou e-mail"
        placeholder="Comece a digitar"
        error={error}
        items={results.data ?? []}
        itemKey={(u) => u.id}
        itemLabel={(u) => u.name}
        itemDescription={(u) => u.email}
        selected={selected}
        onSelect={pick}
        query={query}
        onQueryChange={setQuery}
        loading={results.isFetching}
        loadingText="Buscando..."
        emptyText={term ? 'Ninguém com esse nome ou e-mail.' : 'Digite um nome ou e-mail.'}
      />
      {selected && selected.role !== 'admin' ? (
        <p>{selected.name} passará a poder ocultar e restaurar conteúdo, ver denúncias, tratar pedidos de exclusão e promover outras pessoas.</p>
      ) : null}
    </Dialog>
  )
}

/** Aba Administradores (HU-17): quem são e promover alguém. Rebaixar não tem história (P-13). */
export function AdminsTab() {
  const api = useApi()
  const [open, setOpen] = useState(false)
  const query = useQuery({ queryKey: ADMINS_KEY, queryFn: () => api.listUsers({ role: 'admin' }) })

  return (
    <div className={styles.tab}>
      <div>
        <Button onClick={() => setOpen(true)} icon="plus">Promover alguém a admin</Button>
      </div>
      {query.isPending ? (
        <SkeletonList rows={2} />
      ) : query.isError ? (
        <ErrorState message="Não foi possível carregar os administradores." onRetry={() => void query.refetch()} retrying={query.isRefetching} />
      ) : query.data.length === 0 ? (
        <Alert variant="warning">Nenhuma pessoa administradora encontrada.</Alert>
      ) : (
        <ul className={styles.list} aria-label="Administradores">
          {query.data.map((user) => (
            <li key={user.id} className={`${styles.row} ${styles.person}`}>
              <Avatar name={user.name} />
              <div className={styles.rowMain}>
                <h3 className={styles.rowTitle}>{user.name}</h3>
                <p className="meta">{user.email}</p>
              </div>
              {user.admin_since ? <p className="meta">Admin desde {formatDate(user.admin_since)}</p> : null}
            </li>
          ))}
        </ul>
      )}
      {open ? <PromoteDialog onClose={() => setOpen(false)} /> : null}
    </div>
  )
}
