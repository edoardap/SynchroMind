import { useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { isStatus, type Post } from '../../api'
import { useMe } from '../../app/auth'
import { HiddenBadge, KindBadge, QuestionStateBadge, kindLabel } from '../../components/ui/Badge'
import { Alert, ErrorState, Skeleton } from '../../components/ui/Feedback'
import { formatDate } from '../../lib/dates'
import { useDocumentTitle } from '../../lib/hooks'
import { ContentUnavailable } from '../states/NotFoundPage'
import { usePost } from '../posts/queries'
import { TagList } from '../posts/TagLink'
import { AnswerSection } from './AnswerSection'
import { AuthorLine } from './AuthorLine'
import { ContentActions } from './ContentActions'
import { HiddenBanner } from './HiddenBanner'
import { PostEditForm } from './PostEditForm'
import { useRestore } from './useModeration'
import styles from './detail.module.css'

function DetailSkeleton() {
  return (
    <div role="status" aria-label="Carregando..." className={styles.skeletons}>
      <Skeleton height={20} width={220} />
      <Skeleton height={36} width="70%" />
      <Skeleton height={160} radius={20} />
      <Skeleton height={110} radius={20} />
      <Skeleton height={110} radius={20} />
    </div>
  )
}

function SideCard({ post }: { post: Post }) {
  const isQuestion = post.kind === 'question'
  const title = isQuestion ? 'Sobre esta pergunta' : 'Sobre este post'
  return (
    <section className={styles.side} aria-labelledby="sobre">
      <h2 id="sobre" className={styles.sideTitle}>{title}</h2>
      <dl>
        <div><dt>{isQuestion ? 'Publicada em' : 'Publicado em'}</dt><dd>{formatDate(post.created_at)}</dd></div>
        {post.edited_at ? <div><dt>{isQuestion ? 'Atualizada em' : 'Atualizado em'}</dt><dd>{formatDate(post.edited_at)}</dd></div> : null}
        {post.team ? <div><dt>Time</dt><dd>{post.team.name}</dd></div> : null}
        {isQuestion ? <div><dt>Respostas</dt><dd>{post.answer_count}</dd></div> : null}
        <div><dt>Votos</dt><dd>{post.vote_count}</dd></div>
      </dl>
    </section>
  )
}

function PostArticle({ post }: { post: Post }) {
  const me = useMe()
  const [editing, setEditing] = useState(false)
  const restore = useRestore({ type: 'post', id: post.id })
  const authorName = post.author?.name ?? 'conta excluída'
  const isAdmin = me.role === 'admin'

  if (editing) {
    return (
      <div className={styles.card}>
        <PostEditForm post={post} onClose={() => setEditing(false)} />
      </div>
    )
  }

  return (
    <article aria-label={`${kindLabel(post.kind)} de ${authorName}`} className={styles.articleBody}>
      {post.hidden ? <HiddenBanner hidden={post.hidden} isAdmin={isAdmin} restoring={restore.isPending} onRestore={() => restore.mutate()} /> : null}
      <div className={styles.card}>
        <AuthorLine author={post.author} createdAt={post.created_at} editedAt={post.edited_at} />
        <p className="texto-leitura">{post.body}</p>
        <Actions post={post} onEdit={() => setEditing(true)} />
      </div>
    </article>
  )
}

function Actions({ post, onEdit }: { post: Post; onEdit: () => void }) {
  const me = useMe()
  return (
    <ContentActions
      target={{ type: 'post', id: post.id }}
      isOwn={post.author?.id === me.id}
      voteCount={post.vote_count}
      votedByMe={post.voted_by_me}
      canEdit={post.permissions.can_edit}
      canReport={post.permissions.can_report}
      canHide={post.permissions.can_hide}
      hidden={post.status === 'hidden'}
      onEdit={onEdit}
    />
  )
}

/** B5 e B6: detalhe de pergunta (com respostas, votos e resposta aceita) e de post (texto livre, com o time se houver). */
export function PostDetailPage() {
  const { id = '' } = useParams()
  const location = useLocation()
  const query = usePost(id)
  const post = query.data
  useDocumentTitle(post?.title ?? 'Publicação')
  const notice = (location.state as { notice?: string } | null)?.notice

  if (query.isError) {
    if (isStatus(query.error, 404) || isStatus(query.error, 403)) return <ContentUnavailable />
    return <ErrorState title="Algo deu errado" message="Não foi possível abrir esta publicação." onRetry={() => void query.refetch()} retrying={query.isRefetching} headingLevel={1} />
  }
  if (!post) return <DetailSkeleton />

  return (
    <div className={styles.layout}>
      <div className={styles.main}>
        {notice ? <Alert variant="success">{notice}</Alert> : null}
        <div className={styles.badges}>
          <KindBadge kind={post.kind} />
          {post.kind === 'question' ? <QuestionStateBadge answerCount={post.answer_count} accepted={post.accepted_answer_id !== null} /> : null}
          {post.team ? <span className={styles.teamBadge}>Time {post.team.name}</span> : null}
          {post.status === 'hidden' ? <HiddenBadge /> : null}
          {post.team ? <span className="meta">por {post.author?.name ?? 'Conta excluída'}</span> : null}
        </div>
        <h1 className={styles.title}>{post.title}</h1>
        <TagList tags={post.tags} />
        <PostArticle key={post.id} post={post} />
        {post.kind === 'question' ? <AnswerSection post={post} /> : null}
      </div>
      <aside aria-label="Informações">
        <SideCard post={post} />
      </aside>
    </div>
  )
}
