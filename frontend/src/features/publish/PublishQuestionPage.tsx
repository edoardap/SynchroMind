import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LIMITS } from '../../config/brand'
import { TextAreaField, TextField, toSummary, useFocusFirstError } from '../../components/ui/Form'
import type { FieldErrors } from '../../lib/validation'
import { TagInput } from '../tags/TagInput'
import { PublishShell } from './PublishShell'
import { SimilarPosts } from './SimilarPosts'
import { useCreatePost } from './useCreatePost'

const ORDER = ['title', 'body', 'tags']

/** B3: publicar pergunta (HU-07). O título pode vir da busca sem resultado (?titulo=). */
export function PublishQuestionPage() {
  const [params] = useSearchParams()
  const [title, setTitle] = useState(params.get('titulo') ?? '')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [errors, setErrors] = useState<FieldErrors>({})
  useFocusFirstError(errors, ORDER)
  const create = useCreatePost('Pergunta publicada.', setErrors)

  function submit() {
    const next: FieldErrors = {}
    if (!title.trim()) next.title = 'Informe o título.'
    if (!body.trim()) next.body = 'Descreva a dúvida.'
    if (body.length > LIMITS.maxText) next.body = `O texto passou do limite em ${body.length - LIMITS.maxText} caracteres.`
    setErrors(next)
    if (Object.keys(next).length > 0) return
    create.submit({ kind: 'question', title: title.trim(), body: body.trim(), tags })
  }

  return (
    <PublishShell
      title="Fazer uma pergunta"
      submitLabel="Publicar pergunta"
      pendingLabel="Publicando..."
      dirty={!!(title || body || tags.length)}
      pending={create.pending}
      serverError={create.serverError}
      errors={toSummary(errors, ORDER)}
      onSubmit={submit}
      aside={<SimilarPosts title={title} />}
    >
      <TextField
        label="Qual é a sua dúvida?"
        name="title"
        pill
        placeholder="Como faço para..."
        value={title}
        error={errors.title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={create.pending}
      />
      <TextAreaField
        label="Mais contexto"
        name="body"
        rows={6}
        value={body}
        error={errors.body}
        maxLength={LIMITS.maxText}
        help="O que você já tentou, em qual ambiente, qual erro apareceu."
        onChange={(e) => setBody(e.target.value)}
        disabled={create.pending}
      />
      <TagInput value={tags} onChange={setTags} error={errors.tags} />
    </PublishShell>
  )
}
