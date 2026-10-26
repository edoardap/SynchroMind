import { useState } from 'react'
import { useApi } from '../../app/ApiContext'
import { Icon } from '../../components/ui/Icon'
import { Menu, type MenuItem } from '../../components/ui/Menu'
import { useToast } from '../../components/ui/Toast'
import { useInvalidateContent } from '../posts/queries'
import { ConfirmDialog } from './ConfirmDialog'
import { ReportDialog } from './ReportDialog'
import { useHide, type ContentRef } from './useModeration'
import { VoteButton } from './VoteButton'
import styles from './detail.module.css'

interface ContentActionsProps {
  target: ContentRef
  isOwn: boolean
  voteCount: number
  votedByMe: boolean
  canEdit: boolean
  canReport: boolean
  canHide: boolean
  /** O conteúdo está oculto: sem voto (só autor e admin chegam aqui). */
  hidden: boolean
  onEdit?: () => void
  /** Itens extras no menu (ex.: "Desfazer aceite"). */
  extraItems?: MenuItem[]
  /** Botões no rodapé ao lado do voto (ex.: "Aceitar resposta"). */
  children?: React.ReactNode
}

/** Rodapé de um conteúdo: voto "Foi útil" e menu "Mais ações" (editar, denunciar, ocultar). */
export function ContentActions({ target, isOwn, voteCount, votedByMe, canEdit, canReport, canHide, hidden, onEdit, extraItems = [], children }: ContentActionsProps) {
  const api = useApi()
  const invalidate = useInvalidateContent()
  const toast = useToast()
  const [reportOpen, setReportOpen] = useState(false)
  const [reported, setReported] = useState(false)
  const [hideOpen, setHideOpen] = useState(false)
  const hide = useHide(target, () => setHideOpen(false))

  const items: MenuItem[] = []
  if (canEdit && onEdit) items.push({ label: 'Editar', icon: 'edit', onSelect: onEdit })
  if (canReport) {
    items.push(
      reported
        ? { label: 'Denúncia enviada', icon: 'flag', onSelect: () => undefined, disabled: true }
        : { label: 'Denunciar', icon: 'flag', onSelect: () => setReportOpen(true) },
    )
  }
  if (canHide && !hidden) items.push({ label: 'Ocultar', icon: 'eyeOff', onSelect: () => setHideOpen(true), danger: true })
  items.push(...extraItems)

  async function vote(on: boolean) {
    const result =
      target.type === 'post'
        ? await (on ? api.votePost(target.id) : api.unvotePost(target.id))
        : await (on ? api.voteAnswer(target.id) : api.unvoteAnswer(target.id))
    void invalidate()
    return result
  }

  return (
    <div className={styles.footer}>
      {!hidden || isOwn ? (
        <VoteButton count={voteCount} voted={votedByMe} own={isOwn} onVote={vote} />
      ) : (
        <span />
      )}
      <div className={styles.footerActions}>
        {children}
        {items.length > 0 ? (
          <Menu
            label="Mais ações"
            trigger={<Icon name="more" size={22} />}
            items={items}
          />
        ) : null}
      </div>
      {reportOpen ? (
        <ReportDialog
          onClose={() => setReportOpen(false)}
          onSubmit={(input) => (target.type === 'post' ? api.reportPost(target.id, input) : api.reportAnswer(target.id, input))}
          onDone={() => {
            setReportOpen(false)
            setReported(true)
            toast.show({ message: 'Denúncia enviada. Obrigado por avisar.' })
          }}
        />
      ) : null}
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
    </div>
  )
}
