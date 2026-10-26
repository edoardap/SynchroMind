import { keepPreviousData, useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ListPostsParams } from '../../api'
import { useApi } from '../../app/ApiContext'
import { LIMITS } from '../../config/brand'

type Filters = Omit<ListPostsParams, 'cursor' | 'limit'>

/** Lista paginada por cursor ("Carregar mais"). Chave com o prefixo ["posts"], para invalidar tudo de uma vez. */
export function usePostList(filters: Filters, enabled = true) {
  const api = useApi()
  return useInfiniteQuery({
    queryKey: ['posts', filters],
    queryFn: ({ pageParam }) => api.listPosts({ ...filters, cursor: pageParam, limit: LIMITS.pageSize }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.next_cursor ?? undefined,
    placeholderData: keepPreviousData,
    enabled,
  })
}

export function usePost(id: string) {
  const api = useApi()
  return useQuery({ queryKey: ['post', id], queryFn: () => api.getPost(id) })
}

export function useAnswers(postId: string, enabled: boolean) {
  const api = useApi()
  return useQuery({ queryKey: ['answers', postId], queryFn: () => api.listAnswers(postId), enabled })
}

/** Depois de criar, editar, votar, aceitar, ocultar ou restaurar: listas, detalhe e respostas se atualizam. */
export function useInvalidateContent() {
  const client = useQueryClient()
  return () =>
    Promise.all([
      client.invalidateQueries({ queryKey: ['posts'] }),
      client.invalidateQueries({ queryKey: ['post'] }),
      client.invalidateQueries({ queryKey: ['answers'] }),
      client.invalidateQueries({ queryKey: ['admin'] }),
    ])
}
