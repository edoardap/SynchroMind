import { useMutation } from '@tanstack/react-query'
import { useApi } from '../../app/ApiContext'
import { useToast } from '../../components/ui/Toast'
import { useInvalidateContent } from '../posts/queries'

export type ContentRef = { type: 'post' | 'answer'; id: string }

/** Ocultar (admin, C2). O erro volta para quem chama mostrar na janela de confirmação. */
export function useHide(target: ContentRef, onDone: () => void) {
  const api = useApi()
  const invalidate = useInvalidateContent()
  return useMutation({
    mutationFn: async () => {
      if (target.type === 'post') await api.hidePost(target.id)
      else await api.hideAnswer(target.id)
    },
    onSuccess: async () => {
      await invalidate()
      onDone()
    },
  })
}

/** Restaurar (admin, C2). */
export function useRestore(target: ContentRef) {
  const api = useApi()
  const invalidate = useInvalidateContent()
  const toast = useToast()
  return useMutation({
    mutationFn: async () => {
      if (target.type === 'post') await api.restorePost(target.id)
      else await api.restoreAnswer(target.id)
    },
    onSuccess: async () => {
      await invalidate()
      toast.show({ message: 'Conteúdo restaurado.' })
    },
    onError: () => toast.show({ message: 'Não foi possível restaurar. Tente de novo.', variant: 'error' }),
  })
}
