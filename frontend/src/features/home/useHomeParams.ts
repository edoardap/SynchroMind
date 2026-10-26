import { useSearchParams } from 'react-router-dom'
import type { PostKind, SortOrder } from '../../api'

export interface HomeFilters {
  q: string
  kind?: PostKind
  tag?: string
  sort: SortOrder
}

const KINDS: PostKind[] = ['question', 'post']

/** Busca, tipo, tag e ordenação moram na URL: o link pode ser compartilhado e o botão Voltar funciona (B1). */
export function useHomeParams() {
  const [params, setParams] = useSearchParams()
  const kindParam = params.get('tipo') as PostKind | null
  const filters: HomeFilters = {
    q: params.get('q') ?? '',
    kind: kindParam && KINDS.includes(kindParam) ? kindParam : undefined,
    // A tag não diferencia maiúsculas e minúsculas: a URL guarda sempre a forma em minúsculas.
    tag: params.get('tag')?.toLowerCase() || undefined,
    sort: params.get('ordem') === 'votes' ? 'votes' : 'recent',
  }

  function update(patch: Partial<Record<'q' | 'tipo' | 'tag' | 'ordem', string | undefined>>) {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    setParams(next)
  }

  const activeCount = (filters.kind ? 1 : 0) + (filters.tag ? 1 : 0)
  return { filters, update, clear: () => setParams(new URLSearchParams()), activeCount }
}
