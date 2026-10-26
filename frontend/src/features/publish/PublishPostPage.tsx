import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import type { Team } from '../../api'
import { useApi } from '../../app/ApiContext'
import { Button } from '../../components/ui/Button'
import { Combobox } from '../../components/ui/Combobox'
import { Alert } from '../../components/ui/Feedback'
import { TextAreaField, TextField, toSummary, useFocusFirstError } from '../../components/ui/Form'
import { LIMITS } from '../../config/brand'
import { normalizeText } from '../../lib/text'
import type { FieldErrors } from '../../lib/validation'
import { TagInput } from '../tags/TagInput'
import { PublishShell } from './PublishShell'
import { useCreatePost } from './useCreatePost'

const ORDER = ['title', 'body', 'team_id', 'tags']

/**
 * Criar um post: texto livre sobre qualquer tema da empresa (decisão do usuário; unifica "problema e solução"
 * e "post de time"). O seletor de time é opcional e começa vazio (HU-18, lista de times: P-04).
 */
export function PublishPostPage() {
  const api = useApi()
  const teams = useQuery({ queryKey: ['teams'], queryFn: () => api.listTeams() })
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [team, setTeam] = useState<Team | null>(null)
  const [teamQuery, setTeamQuery] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [errors, setErrors] = useState<FieldErrors>({})
  useFocusFirstError(errors, ORDER)
  const create = useCreatePost('Publicado. Todos na empresa já podem ver.', setErrors)

  const filtered = (teams.data ?? []).filter((t) => normalizeText(t.name).includes(normalizeText(teamQuery)) || team?.id === t.id)

  function submit() {
    const next: FieldErrors = {}
    if (!title.trim()) next.title = 'Informe o título.'
    if (!body.trim()) next.body = 'Escreva o texto do post.'
    else if (body.length > LIMITS.maxText) next.body = `O texto passou do limite em ${body.length - LIMITS.maxText} caracteres.`
    setErrors(next)
    if (Object.keys(next).length > 0) return
    create.submit({ kind: 'post', title: title.trim(), body: body.trim(), tags, ...(team ? { team_id: team.id } : {}) })
  }

  return (
    <PublishShell
      title="Criar um post"
      submitLabel="Publicar post"
      pendingLabel="Publicando..."
      dirty={!!(title || body || team || tags.length)}
      pending={create.pending}
      serverError={create.serverError}
      errors={toSummary(errors, ORDER)}
      onSubmit={submit}
    >
      <TextField
        label="Título"
        name="title"
        pill
        value={title}
        error={errors.title}
        help="Escolha um título que outra pessoa usaria para buscar este post."
        onChange={(e) => setTitle(e.target.value)}
        disabled={create.pending}
      />
      <TextAreaField
        label="Texto"
        name="body"
        rows={8}
        value={body}
        error={errors.body}
        maxLength={LIMITS.maxText}
        help="Pode ser uma solução que você encontrou, um aviso, uma novidade do seu time ou qualquer assunto da empresa."
        onChange={(e) => setBody(e.target.value)}
        disabled={create.pending}
      />
      {teams.isError ? (
        <Alert variant="error" action={<Button variant="outline" onClick={() => void teams.refetch()}>Tentar de novo</Button>}>
          Não foi possível carregar os times.
        </Alert>
      ) : teams.isSuccess && teams.data.length === 0 ? (
        <p className="meta">Nenhum time cadastrado ainda. Você pode publicar o post em seu nome.</p>
      ) : (
        <Combobox<Team>
          label="Publicar em nome de um time"
          name="team_id"
          optional
          placeholder="Nenhum: o post é seu"
          help="Se escolher um time, o post aparece com o nome do time e com o seu nome."
          error={errors.team_id}
          items={filtered}
          itemKey={(t) => t.id}
          itemLabel={(t) => t.name}
          selected={team}
          onSelect={setTeam}
          query={teamQuery}
          onQueryChange={setTeamQuery}
          loading={teams.isPending}
          loadingText="Carregando times..."
          emptyText="Nenhum time com esse nome."
        />
      )}
      <TagInput value={tags} onChange={setTags} error={errors.tags} />
    </PublishShell>
  )
}
