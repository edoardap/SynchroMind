import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Report, ReportFilter, ReportReason } from '../../api'
import { useApi } from '../../app/ApiContext'
import { Badge, kindLabel } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ErrorState, SkeletonList, StateBlock } from '../../components/ui/Feedback'
import { FilterToggle } from '../../components/ui/FilterToggle'
import { useToast } from '../../components/ui/Toast'
import { formatRelative, formatShortDate } from '../../lib/dates'
import { ConfirmDialog } from '../detail/ConfirmDialog'
import { useHide } from '../detail/useModeration'
import { useInvalidateContent } from '../posts/queries'
import styles from './admin.module.css'

const REASON_LABEL: Record<ReportReason, string> = {
  incorrect: 'Informação errada ou desatualizada',
  offensive: 'Conteúdo ofensivo',
  confidential: 'Conteúdo confidencial',
  other: 'Outro motivo',
}

export const REPORTS_KEY = (filter: ReportFilter) => ['admin', 'reports', filter] as const

function ReportRow({ report }: { report: Report }) {
  const api = useApi()
  const client = useQueryClient()
  const toast = useToast()
  const invalidate = useInvalidateContent()
  const [hideOpen, setHideOpen] = useState(false)
  const hide = useHide({ type: report.target_type, id: report.target_id }, () => setHideOpen(false))
  const dismiss = useMutation({
    mutationFn: () => api.dismissReport(report.id),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['admin', 'reports'] })
      await invalidate()
    },
    onError: () => toast.show({ message: 'Não foi possível dispensar a denúncia. Tente de novo.', variant: 'error' }),
  })
  const open = report.status === 'open'
  const typeLabel = report.target_kind === 'answer' ? 'Resposta' : kindLabel(report.target_kind)

  return (
    <li className={styles.row}>
      <div className={styles.rowMain}>
        <div className={styles.rowMeta}>
          <Badge tone="outline">{typeLabel}</Badge>
          <span className="meta">Denunciada {formatRelative(report.created_at)}</span>
        </div>
        <h3 className={styles.rowTitle}>{report.target_title}</h3>
        <p className={styles.excerpt}>{report.target_excerpt}</p>
        <p><strong>{REASON_LABEL[report.reason]}</strong></p>
        {report.details ? <p className={styles.details}>{report.details}</p> : null}
        {!open && report.resolved_at ? (
          <p className="meta">
            {report.status === 'actioned' ? 'Ocultado' : 'Dispensada'} por {report.resolved_by?.name ?? 'um administrador'} em {formatShortDate(report.resolved_at)}
          </p>
        ) : null}
      </div>
      <div className={styles.rowActions}>
        <Link to={`/posts/${report.post_id}`} className={styles.linkAction} aria-label={`Ver conteúdo: ${report.target_title}`}>Ver conteúdo</Link>
        {open ? (
          <>
            {report.target_status === 'visible' ? (
              <Button variant="outline" onClick={() => setHideOpen(true)} aria-label={`Ocultar: ${report.target_title}`}>Ocultar</Button>
            ) : null}
            <Button variant="text" onClick={() => dismiss.mutate()} loading={dismiss.isPending} loadingText="Dispensando..." aria-label={`Dispensar denúncia: ${report.target_title}`}>Dispensar denúncia</Button>
          </>
        ) : null}
      </div>
      {hideOpen ? (
        <ConfirmDialog
          title="Ocultar este conteúdo?"
          confirmLabel="Ocultar"
          pendingLabel="Ocultando..."
          pending={hide.isPending}
          error={hide.isError ? 'Não foi possível ocultar. Tente de novo.' : undefined}
          onConfirm={() => hide.mutate()}
          onClose={() => setHideOpen(false)}
        >
          <p>Ele deixa de aparecer para as outras pessoas. Você pode restaurá-lo depois.</p>
        </ConfirmDialog>
      ) : null}
    </li>
  )
}

/** Aba Denúncias (HU-16): abertas por padrão; "Dispensar denúncia" é sugestão do design (P-11). */
export function ReportsTab() {
  const api = useApi()
  const [filter, setFilter] = useState<ReportFilter>('open')
  const query = useQuery({ queryKey: REPORTS_KEY(filter), queryFn: () => api.listReports(filter) })

  return (
    <div className={styles.tab}>
      <FilterToggle
        legend="Mostrar denúncias"
        options={[{ value: 'open', label: 'Abertas' }, { value: 'resolved', label: 'Resolvidas' }]}
        value={filter}
        onChange={setFilter}
      />
      {query.isPending ? (
        <SkeletonList rows={3} />
      ) : query.isError ? (
        <ErrorState message="Não foi possível carregar as denúncias." onRetry={() => void query.refetch()} retrying={query.isRefetching} />
      ) : query.data.items.length === 0 ? (
        <StateBlock icon="checkCircle" title={filter === 'open' ? 'Nenhuma denúncia aberta.' : 'Nenhuma denúncia resolvida.'} />
      ) : (
        <ul className={styles.list} aria-label="Denúncias">
          {query.data.items.map((report) => <ReportRow key={report.id} report={report} />)}
        </ul>
      )}
    </div>
  )
}
