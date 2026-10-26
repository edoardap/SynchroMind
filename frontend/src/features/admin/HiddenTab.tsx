import { useMutation } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import type { PostSummary } from '../../api'
import { useApi } from '../../app/ApiContext'
import { AuthorName } from '../../components/ui/Avatar'
import { KindBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ErrorState, SkeletonList, StateBlock } from '../../components/ui/Feedback'
import { useToast } from '../../components/ui/Toast'
import { formatShortDate } from '../../lib/dates'
import { usePostList, useInvalidateContent } from '../posts/queries'
import styles from './admin.module.css'

function HiddenRow({ post }: { post: PostSummary }) {
  const api = useApi()
  const toast = useToast()
  const invalidate = useInvalidateContent()

  const hideAgain = useMutation({
    mutationFn: () => api.hidePost(post.id),
    onSuccess: () => invalidate(),
  })
  const restore = useMutation({
    mutationFn: () => api.restorePost(post.id),
    onSuccess: async () => {
      await invalidate()
      toast.show({ message: 'Restaurado.', durationMs: 8000, action: { label: 'Desfazer', onClick: () => hideAgain.mutate() } })
    },
    onError: () => toast.show({ message: 'Não foi possível restaurar. Tente de novo.', variant: 'error' }),
  })

  return (
    <li className={styles.row}>
      <div className={styles.rowMain}>
        <div className={styles.rowMeta}>
          <KindBadge kind={post.kind} />
          <span className="meta"><AuthorName name={post.author?.name ?? null} /></span>
        </div>
        <h3 className={styles.rowTitle}>{post.title}</h3>
        <p className={styles.excerpt}>{post.excerpt}</p>
        {post.hidden ? (
          <p className="meta">Ocultado por {post.hidden.by?.name ?? 'um administrador'} em {formatShortDate(post.hidden.at)}</p>
        ) : null}
      </div>
      <div className={styles.rowActions}>
        <Link to={`/posts/${post.id}`} className={styles.linkAction} aria-label={`Ver conteúdo: ${post.title}`}>Ver conteúdo</Link>
        <Button onClick={() => restore.mutate()} loading={restore.isPending} loadingText="Restaurando..." icon="restore" aria-label={`Restaurar: ${post.title}`}>
          Restaurar
        </Button>
      </div>
    </li>
  )
}

/** Aba Ocultos (HU-15): restaurar sem confirmação, com "Desfazer" por 8 segundos. */
export function HiddenTab() {
  const query = usePostList({ status: 'hidden' })
  const items = query.data?.pages.flatMap((p) => p.items) ?? []
  return (
    <div className={styles.tab}>
      {query.isPending ? (
        <SkeletonList rows={3} />
      ) : query.isError ? (
        <ErrorState message="Não foi possível carregar os conteúdos ocultos." onRetry={() => void query.refetch()} retrying={query.isRefetching} />
      ) : items.length === 0 ? (
        <StateBlock icon="checkCircle" title="Nenhum conteúdo oculto." />
      ) : (
        <ul className={styles.list} aria-label="Conteúdos ocultos">
          {items.map((post) => <HiddenRow key={post.id} post={post} />)}
        </ul>
      )}
    </div>
  )
}
