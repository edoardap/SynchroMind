import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { isApiError, type Post, type PostPatch } from '../../api'
import { useApi } from '../../app/ApiContext'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Feedback'
import { TextAreaField, TextField, toSummary, ErrorSummary, useFocusFirstError } from '../../components/ui/Form'
import { useToast } from '../../components/ui/Toast'
import { LIMITS } from '../../config/brand'
import { fieldErrorsFrom, type FieldErrors } from '../../lib/validation'
import { TagInput } from '../tags/TagInput'
import { useInvalidateContent } from '../posts/queries'
import { ConfirmDialog } from './ConfirmDialog'
import styles from './detail.module.css'

const EMPTY = 'Este campo não pode ficar vazio.'

/** B7: edição no próprio cartão, com os mesmos rótulos da publicação (HU-09). */
export function PostEditForm({ post, onClose }: { post: Post; onClose: () => void }) {
  const api = useApi()
  const invalidate = useInvalidateContent()
  const toast = useToast()
  const [title, setTitle] = useState(post.title)
  const [body, setBody] = useState(post.body)
  const [tags, setTags] = useState(post.tags.map((t) => t.slug))
  const [errors, setErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const order = ['title', 'body', 'tags']
  useFocusFirstError(errors, order)

  const dirty =
    title !== post.title || body !== post.body || tags.join() !== post.tags.map((t) => t.slug).join()

  const save = useMutation({
    mutationFn: (patch: PostPatch) => api.updatePost(post.id, patch),
    onSuccess: async () => {
      await invalidate()
      toast.show({ message: 'Alterações salvas.' })
      onClose()
    },
    onError: (error) => {
      if (isApiError(error) && error.status === 422 && error.details.length > 0) setErrors(fieldErrorsFrom(error))
      else setServerError(true)
    },
  })

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const next: FieldErrors = {}
    if (!title.trim()) next.title = EMPTY
    if (!body.trim()) next.body = EMPTY
    setErrors(next)
    setServerError(false)
    if (Object.keys(next).length > 0) return
    save.mutate({ title: title.trim(), body: body.trim(), tags })
  }

  return (
    <form className={styles.editForm} onSubmit={submit} noValidate>
      <ErrorSummary items={toSummary(errors, order)} />
      {serverError ? <Alert variant="error">Não foi possível salvar. Suas alterações continuam aqui.</Alert> : null}
      <TextField label="Título" name="title" pill value={title} error={errors.title} onChange={(e) => setTitle(e.target.value)} />
      <TextAreaField
        label={post.kind === 'question' ? 'Mais contexto' : 'Texto'}
        name="body"
        rows={6}
        value={body}
        error={errors.body}
        maxLength={LIMITS.maxText}
        onChange={(e) => setBody(e.target.value)}
      />
      <TagInput value={tags} onChange={setTags} error={errors.tags} knownNames={Object.fromEntries(post.tags.map((t) => [t.slug, t.name]))} />
      <div className={styles.editActions}>
        <Button type="submit" loading={save.isPending} loadingText="Salvando...">Salvar alterações</Button>
        <Button variant="outline" onClick={() => (dirty ? setConfirmOpen(true) : onClose())}>Cancelar</Button>
      </div>
      {confirmOpen ? (
        <ConfirmDialog
          title="Descartar o que você escreveu?"
          confirmLabel="Descartar"
          pendingLabel="Descartando..."
          cancelLabel="Continuar editando"
          danger
          onConfirm={onClose}
          onClose={() => setConfirmOpen(false)}
        >
          <p>As alterações não serão guardadas.</p>
        </ConfirmDialog>
      ) : null}
    </form>
  )
}
