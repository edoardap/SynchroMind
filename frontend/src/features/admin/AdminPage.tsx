import { useQuery } from '@tanstack/react-query'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useApi } from '../../app/ApiContext'
import { Tabs } from '../../components/ui/Tabs'
import { useDocumentTitle } from '../../lib/hooks'
import { AdminsTab } from './AdminsTab'
import { DELETIONS_KEY, DeletionsTab } from './DeletionsTab'
import { HiddenTab } from './HiddenTab'
import { REPORTS_KEY, ReportsTab } from './ReportsTab'
import styles from './admin.module.css'

const TABS = ['denuncias', 'ocultos', 'exclusoes', 'administradores'] as const
type TabId = (typeof TABS)[number]

/** C1: administração com quatro abas; a aba mora na URL (/admin/ocultos). Só admin chega aqui. */
export function AdminPage() {
  useDocumentTitle('Administração')
  const api = useApi()
  const navigate = useNavigate()
  const { aba } = useParams()
  const reports = useQuery({ queryKey: REPORTS_KEY('open'), queryFn: () => api.listReports('open') })
  const deletions = useQuery({ queryKey: DELETIONS_KEY('pending'), queryFn: () => api.listDeletionRequests('pending') })

  if (aba !== undefined && !TABS.includes(aba as TabId)) return <Navigate to="/admin" replace />
  const active: TabId = (aba as TabId | undefined) ?? 'denuncias'

  const openReports = reports.data?.items.length
  const pendingDeletions = deletions.data?.length
  const withCount = (label: string, count: number | undefined) => (count ? `${label} (${count})` : label)

  return (
    <div className={styles.page}>
      <h1>Administração</h1>
      <Tabs
        label="Áreas da administração"
        active={active}
        onChange={(id) => navigate(id === 'denuncias' ? '/admin' : `/admin/${id}`, { state: { keepFocus: true } })}
        tabs={[
          { id: 'denuncias', label: withCount('Denúncias', openReports) },
          { id: 'ocultos', label: 'Ocultos' },
          { id: 'exclusoes', label: withCount('Pedidos de exclusão', pendingDeletions) },
          { id: 'administradores', label: 'Administradores' },
        ]}
      >
        {active === 'denuncias' ? <ReportsTab /> : null}
        {active === 'ocultos' ? <HiddenTab /> : null}
        {active === 'exclusoes' ? <DeletionsTab /> : null}
        {active === 'administradores' ? <AdminsTab /> : null}
      </Tabs>
    </div>
  )
}
