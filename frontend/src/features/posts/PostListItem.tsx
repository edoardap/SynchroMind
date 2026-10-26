import { Link } from 'react-router-dom'
import type { PostSummary } from '../../api'
import { AuthorName } from '../../components/ui/Avatar'
import { HiddenBadge, KindBadge, QuestionStateBadge } from '../../components/ui/Badge'
import { formatRelative } from '../../lib/dates'
import { pluralize, splitByTerms } from '../../lib/text'
import { TagList } from './TagLink'
import styles from './posts.module.css'

export function Highlight({ text, terms }: { text: string; terms: string[] }) {
  const parts = splitByTerms(text, terms)
  return (
    <>
      {parts.map((part, i) => (part.match ? <b key={i} className={styles.match}>{part.text}</b> : <span key={i}>{part.text}</span>))}
    </>
  )
}

interface PostListItemProps {
  post: PostSummary
  terms?: string[]
  /** "Minhas publicações": itens ocultos mostram o selo e a explicação. */
  showHiddenNote?: boolean
}

/** Item da lista (B1, B9): metadados, título, trecho, tags e, à direita, votos e respostas. */
export function PostListItem({ post, terms = [], showHiddenNote }: PostListItemProps) {
  const votes = pluralize(post.vote_count, 'voto', 'votos')
  const answers = pluralize(post.answer_count, 'resposta', 'respostas')
  const isQuestion = post.kind === 'question'
  return (
    <li className={styles.item}>
      <div className={styles.itemMain}>
        <div className={styles.meta}>
          <KindBadge kind={post.kind} />
          {isQuestion ? <QuestionStateBadge answerCount={post.answer_count} accepted={post.accepted_answer_id !== null} /> : null}
          {post.status === 'hidden' ? <HiddenBadge /> : null}
          <span className="meta">
            {post.team ? <>Time {post.team.name} · por </> : null}
            <AuthorName name={post.author?.name ?? null} /> · {formatRelative(post.created_at)}
          </span>
        </div>
        <h3 className={styles.itemTitle}>
          <Link to={`/posts/${post.id}`}>
            <Highlight text={post.title} terms={terms} />
          </Link>
        </h3>
        <p className={styles.excerpt}>
          <Highlight text={post.excerpt} terms={terms} />
        </p>
        <TagList tags={post.tags} />
        {showHiddenNote && post.status === 'hidden' ? (
          <p className="meta">Só você e os administradores veem este conteúdo.</p>
        ) : null}
      </div>
      <div className={styles.stats}>
        <span className={styles.stat}>
          <b>{post.vote_count}</b> {votes.replace(/^\d+ /, '')}
        </span>
        {isQuestion ? (
          <span className={styles.stat}>
            <b>{post.answer_count}</b> {answers.replace(/^\d+ /, '')}
          </span>
        ) : null}
      </div>
    </li>
  )
}
