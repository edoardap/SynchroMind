import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isApiError, type NewPost, type Post } from '../../api'
import { useApi } from '../../app/ApiContext'
import { fieldErrorsFrom, type FieldErrors } from '../../lib/validation'
import { useInvalidateContent } from '../posts/queries'

/** Publica, atualiza as listas e leva ao detalhe com o aviso de sucesso. Erros 422 viram erros por campo. */
export function useCreatePost(successNotice: string, onFieldErrors: (errors: FieldErrors) => void) {
  const api = useApi()
  const navigate = useNavigate()
  const invalidate = useInvalidateContent()
  const [serverError, setServerError] = useState(false)

  const mutation = useMutation({
    mutationFn: (input: NewPost) => api.createPost(input),
    onMutate: () => setServerError(false),
    onSuccess: async (post: Post) => {
      await invalidate()
      navigate(`/posts/${post.id}`, { state: { notice: successNotice, bypassGuard: true } })
    },
    onError: (error) => {
      if (isApiError(error) && error.status === 422 && error.details.length > 0) onFieldErrors(fieldErrorsFrom(error))
      else setServerError(true)
    },
  })

  return { submit: mutation.mutate, pending: mutation.isPending, serverError }
}
