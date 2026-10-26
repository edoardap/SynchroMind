import { Button, ButtonLink } from '../../components/ui/Button'
import { ErrorState, SkeletonList, StateBlock } from '../../components/ui/Feedback'
import { useDocumentTitle } from '../../lib/hooks'
import { PostListItem } from '../posts/PostListItem'
import { usePostList } from '../posts/queries'
import postStyles from '../posts/posts.module.css'
import styles from './account.module.css'

/** B9: o que a pessoa publicou, inclusive o que está oculto (2.5). Sem busca nem filtros no MVP. */
export function MyPostsPage() {
  useDocumentTitle('Minhas publicações')
  const query = usePostList({ author: 'me' })
  const items = query.data?.pages.flatMap((p) => p.items) ?? []

  return (
    <div className={styles.page}>
      <h1>Minhas publicações</h1>
      {query.isPending ? (
        <SkeletonList rows={4} />
      ) : query.isError ? (
        <ErrorState message="Não foi possível carregar as publicações." onRetry={() => void query.refetch()} retrying={query.isRefetching} />
      ) : items.length === 0 ? (
        <StateBlock
          icon="message"
          title="Você ainda não publicou nada."
          actions={
            <>
              <ButtonLink to="/publicar/post">Criar um post</ButtonLink>
              <ButtonLink to="/publicar/pergunta" variant="outline">Fazer uma pergunta</ButtonLink>
            </>
          }
        />
      ) : (
        <>
          <ul className={postStyles.list} aria-label="Minhas publicações">
            {items.map((post) => <PostListItem key={post.id} post={post} showHiddenNote />)}
          </ul>
          {query.hasNextPage ? (
            <div className={styles.more}>
              <Button variant="outline" onClick={() => void query.fetchNextPage()} loading={query.isFetchingNextPage} loadingText="Carregando...">Carregar mais</Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
