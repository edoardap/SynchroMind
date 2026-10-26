import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { isApiError, type Answer, type Post } from '../../api'
import { useApi } from '../../app/ApiContext'
import { useMe } from '../../app/auth'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Alert, ErrorState, Skeleton } from '../../components/ui/Feedback'
import { TextAreaField } from '../../components/ui/Form'
import { useToast } from '../../components/ui/Toast'
import { LIMITS } from '../../config/brand'
import { pluralize } from '../../lib/text'
import { useAnswers, useInvalidateContent } from '../posts/queries'
import { AuthorLine } from './AuthorLine'
import { ConfirmDialog } from './ConfirmDialog'
import { ContentActions } from './ContentActions'
import { HiddenBanner } from './HiddenBanner'
import { useRestore } from './useModeration'
import styles from './detail.module.css'

function AnswerEditForm({ answer, onClose }: { answer: Answer; onClose: () => void }) {
  const api = useApi()
  const invalidate = useInvalidateContent()
  const toast = useToast()
  const [body, setBody] = useState(answer.body)
  const [error, setError] = useState<string>()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const save = useMutation({
    mutationFn: () => api.updateAnswer(answer.id, body.trim()),
    onSuccess: async () => {
      await invalidate()
      toast.show({ message: 'Alterações salvas.' })
      onClose()
    },
    onError: () => setError('Não foi possível salvar. Suas alterações continuam aqui.'),
  })
  return (
    <form
      className={styles.editForm}
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        if (!body.trim()) return setError('Este campo não pode ficar vazio.')
        setError(undefined)
        save.mutate()
      }}
    >
      <TextAreaField label="Sua resposta" rows={4} value={body} error={error} maxLength={LIMITS.maxText} onChange={(e) => setBody(e.target.value)} />
      <div className={styles.editActions}>
        <Button type="submit" loading={save.isPending} loadingText="Salvando...">Salvar alterações</Button>
        <Button variant="outline" onClick={() => (body !== answer.body ? setConfirmOpen(true) : onClose())}>Cancelar</Button>
      </div>
      {confirmOpen ? (
        <ConfirmDialog title="Descartar o que você escreveu?" confirmLabel="Descartar" pendingLabel="Descartando..." cancelLabel="Continuar editando" danger onConfirm={onClose} onClose={() => setConfirmOpen(false)}>
          <p>As alterações não serão guardadas.</p>
        </ConfirmDialog>
      ) : null}
    </form>
  )
}

interface AnswerCardProps {
  answer: Answer
  post: Post
  onAccept: (answer: Answer) => void
  onUnaccept: () => void
}

function AnswerCard({ answer, post, onAccept, onUnaccept }: AnswerCardProps) {
  const me = useMe()
  const [editing, setEditing] = useState(false)
  const restore = useRestore({ type: 'answer', id: answer.id })
  const authorName = answer.author?.name ?? 'conta excluída'
  const isOwn = answer.author?.id === me.id
  const showAccept = post.permissions.can_accept && !answer.is_accepted && answer.status === 'visible'
  return (
    <article
      id={`resposta-${answer.id}`}
      tabIndex={-1}
      aria-label={`Resposta de ${authorName}`}
      className={[styles.card, answer.is_accepted ? styles.accepted : ''].filter(Boolean).join(' ')}
    >
      {answer.is_accepted ? (
        <div className={styles.acceptedBadge}><Badge tone="primary" icon="check">Resposta aceita</Badge></div>
      ) : null}
      {answer.hidden ? <HiddenBanner hidden={answer.hidden} isAdmin={me.role === 'admin'} restoring={restore.isPending} onRestore={() => restore.mutate()} /> : null}
      <AuthorLine author={answer.author} createdAt={answer.created_at} editedAt={answer.edited_at} />
      {editing ? (
        <AnswerEditForm answer={answer} onClose={() => setEditing(false)} />
      ) : (
        <p className="texto-leitura">{answer.body}</p>
      )}
      <ContentActions
        target={{ type: 'answer', id: answer.id }}
        isOwn={isOwn}
        voteCount={answer.vote_count}
        votedByMe={answer.voted_by_me}
        canEdit={answer.permissions.can_edit}
        canReport={answer.permissions.can_report}
        canHide={answer.permissions.can_hide}
        hidden={answer.status === 'hidden'}
        onEdit={() => setEditing(true)}
        extraItems={answer.is_accepted && post.permissions.can_accept ? [{ label: 'Desfazer aceite', icon: 'restore', onSelect: onUnaccept }] : []}
      >
        {showAccept ? <Button variant="outline" icon="check" onClick={() => onAccept(answer)}>Aceitar resposta</Button> : null}
      </ContentActions>
    </article>
  )
}

function AnswerForm({ postId }: { postId: string }) {
  const api = useApi()
  const invalidate = useInvalidateContent()
  const [body, setBody] = useState('')
  const [error, setError] = useState<string>()
  const [serverError, setServerError] = useState(false)
  const create = useMutation({
    mutationFn: () => api.createAnswer(postId, body.trim()),
    onSuccess: async () => {
      await invalidate()
      setBody('')
    },
    onError: (e) => {
      if (isApiError(e) && e.status === 422) setError('Escreva a sua resposta antes de enviar.')
      else setServerError(true)
    },
  })
  return (
    <form
      className={styles.answerForm}
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        setServerError(false)
        if (!body.trim()) return setError('Escreva a sua resposta antes de enviar.')
        setError(undefined)
        create.mutate()
      }}
    >
      {serverError ? <Alert variant="error">Não foi possível publicar. O texto continua aqui. Tente de novo.</Alert> : null}
      <TextAreaField label="Sua resposta" rows={4} value={body} error={error} maxLength={LIMITS.maxText} onChange={(e) => setBody(e.target.value)} />
      <div>
        <Button type="submit" loading={create.isPending} loadingText="Publicando...">Publicar resposta</Button>
      </div>
    </form>
  )
}

/** Respostas da pergunta: a aceita no topo, depois por votos (ordem do servidor), e o formulário "Sua resposta" (HU-08, HU-14). */
export function AnswerSection({ post }: { post: Post }) {
  const api = useApi()
  const invalidate = useInvalidateContent()
  const toast = useToast()
  const answers = useAnswers(post.id, true)
  const [switchTo, setSwitchTo] = useState<Answer | null>(null)

  const accept = useMutation({
    mutationFn: (answer: Answer) => api.acceptAnswer(post.id, answer.id),
    onSuccess: async (_post, answer) => {
      setSwitchTo(null)
      await invalidate()
      toast.show({ message: 'Resposta aceita.' })
      document.getElementById(`resposta-${answer.id}`)?.focus()
    },
    onError: () => {
      setSwitchTo(null)
      toast.show({ message: 'Não foi possível aceitar a resposta. Tente de novo.', variant: 'error' })
    },
  })
  const unaccept = useMutation({
    mutationFn: () => api.unacceptAnswer(post.id),
    onSuccess: async () => {
      await invalidate()
      toast.show({ message: 'Aceite desfeito.' })
    },
    onError: () => toast.show({ message: 'Não foi possível desfazer. Tente de novo.', variant: 'error' }),
  })

  function onAccept(answer: Answer) {
    const hasAccepted = answers.data?.some((a) => a.is_accepted)
    if (hasAccepted) setSwitchTo(answer)
    else accept.mutate(answer)
  }

  const visible = answers.data?.filter((a) => a.status === 'visible') ?? []
  const count = visible.length

  return (
    <section aria-labelledby="respostas" className={styles.answers}>
      {answers.isPending ? (
        <div role="status" aria-label="Carregando respostas..." className={styles.skeletons}>
          <Skeleton height={28} width={140} />
          <Skeleton height={120} radius={20} />
          <Skeleton height={120} radius={20} />
        </div>
      ) : answers.isError ? (
        <ErrorState message="Não foi possível carregar as respostas." onRetry={() => void answers.refetch()} />
      ) : (
        <>
          <h2 id="respostas">{pluralize(count, 'resposta', 'respostas')}</h2>
          {answers.data.length === 0 ? (
            <div className={styles.noAnswers}>
              <p><strong>Ainda ninguém respondeu.</strong></p>
              <p className="meta">Você sabe como resolver? Escreva a primeira resposta abaixo.</p>
            </div>
          ) : (
            answers.data.map((answer) => (
              <AnswerCard key={answer.id} answer={answer} post={post} onAccept={onAccept} onUnaccept={() => unaccept.mutate()} />
            ))
          )}
        </>
      )}
      <AnswerForm postId={post.id} />
      {switchTo ? (
        <ConfirmDialog
          title="Trocar a resposta aceita?"
          confirmLabel="Trocar"
          pendingLabel="Trocando..."
          pending={accept.isPending}
          onConfirm={() => accept.mutate(switchTo)}
          onClose={() => setSwitchTo(null)}
        >
          <p>A resposta atual deixa de ser a aceita.</p>
        </ConfirmDialog>
      ) : null}
    </section>
  )
}
