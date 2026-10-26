import { useQuery } from '@tanstack/react-query'
import { useId, useState } from 'react'
import type { PostKind } from '../../api'
import { useApi } from '../../app/ApiContext'
import { useDebounced } from '../../lib/useDebounced'
import { slugifyTag } from '../../lib/text'
import formStyles from '../../components/ui/Form.module.css'
import styles from './home.module.css'

const KIND_OPTIONS: { value: PostKind | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'question', label: 'Perguntas' },
  { value: 'post', label: 'Posts' },
]

interface FilterPanelProps {
  kind?: PostKind
  tag?: string
  onKind: (kind: PostKind | undefined) => void
  onTag: (tag: string | undefined) => void
}

/** Filtros: grupo "Tipo" e grupo "Tags" (as mais usadas e busca de tag). Aplica na hora. */
export function FilterPanel({ kind, tag, onKind, onTag }: FilterPanelProps) {
  const api = useApi()
  const radioName = useId()
  const [tagQuery, setTagQuery] = useState('')
  const debounced = useDebounced(slugifyTag(tagQuery), 200)
  const tags = useQuery({ queryKey: ['tags', debounced], queryFn: () => api.suggestTags(debounced), staleTime: 30_000 })

  return (
    <div className={styles.filters}>
      <fieldset className={styles.group}>
        <legend className="rotulo">Tipo</legend>
        {KIND_OPTIONS.map((option) => (
          <label key={option.label} className={formStyles.choice}>
            <input
              type="radio"
              name={radioName}
              className={formStyles.radio}
              checked={(kind ?? '') === option.value}
              onChange={() => onKind(option.value || undefined)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </fieldset>
      <div className={styles.group}>
        <p className="rotulo" id="grupo-tags">Tags</p>
        <label className="somente-leitor" htmlFor="buscar-tag">Buscar tag</label>
        <input
          id="buscar-tag"
          type="search"
          className={formStyles.input}
          placeholder="Buscar tag"
          value={tagQuery}
          onChange={(e) => setTagQuery(e.target.value)}
        />
        {tags.isPending ? (
          <p className="meta" role="status">Buscando tags...</p>
        ) : tags.isError ? (
          <p className="meta">Não foi possível carregar as tags.</p>
        ) : tags.data.length === 0 ? (
          <p className="meta">Nenhuma tag encontrada.</p>
        ) : (
          <ul className={styles.tagPills} aria-labelledby="grupo-tags">
            {tags.data.map((t) => (
              <li key={t.slug}>
                <button
                  type="button"
                  className={styles.pill}
                  aria-pressed={tag === t.slug}
                  onClick={() => onTag(tag === t.slug ? undefined : t.slug)}
                >
                  #{t.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
