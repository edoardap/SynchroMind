import { useQuery } from '@tanstack/react-query'
import { useApi } from '../../app/ApiContext'
import { KindBadge } from '../../components/ui/Badge'
import { pluralize } from '../../lib/text'
import { useDebounced } from '../../lib/useDebounced'
import styles from './publish.module.css'

/**
 * "Talvez já esteja respondido" (B3, sugestão do design, opcional): até 3 publicações achadas pela mesma busca de B1.
 * Sem história própria. Para remover do MVP, apague o uso em PublishQuestionPage. Vazio e erro: o bloco some.
 */
export function SimilarPosts({ title }: { title: string }) {
  const api = useApi()
  const term = useDebounced(title.trim(), 500)
  const enabled = term.length >= 4
  const query = useQuery({
    queryKey: ['similar-posts', term],
    queryFn: () => api.listPosts({ q: term, limit: 3 }),
    enabled,
    staleTime: 30_000,
  })

  if (!enabled || query.isError) return null
  if (query.isPending) return <p className="meta" role="status">Procurando publicações parecidas...</p>
  const items = query.data.items.slice(0, 3)
  if (items.length === 0) return null

  return (
    <section className={styles.similar} aria-labelledby="parecidas">
      <h2 id="parecidas">Talvez já esteja respondido</h2>
      <ul>
        {items.map((post) => (
          <li key={post.id}>
            <a href={`/posts/${post.id}`} target="_blank" rel="noopener noreferrer">{post.title}<span className="somente-leitor"> (abre em nova aba)</span></a>
            <span className={styles.similarMeta}>
              <KindBadge kind={post.kind} />
              <span className="meta">{pluralize(post.vote_count, 'voto', 'votos')}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
