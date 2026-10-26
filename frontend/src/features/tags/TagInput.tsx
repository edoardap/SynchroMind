import { useQuery } from '@tanstack/react-query'
import { useId, useState } from 'react'
import { useApi } from '../../app/ApiContext'
import { LIMITS } from '../../config/brand'
import { isValidTag, slugifyTag } from '../../lib/text'
import { useDebounced } from '../../lib/useDebounced'
import { FieldError, fieldIds } from '../../components/ui/Form'
import formStyles from '../../components/ui/Form.module.css'
import { Icon } from '../../components/ui/Icon'
import styles from './TagInput.module.css'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  error?: string
  /** Nomes com a caixa original das tags já escolhidas (ex.: na edição). */
  knownNames?: Record<string, string>
}

/**
 * Campo de tags (4.7): pílulas removíveis, sugestões de tags já usadas (HU-11, critério 2),
 * Enter ou vírgula adicionam, limite de 5 e formato (minúsculas, letras, números e hífen).
 */
export function TagInput({ value, onChange, error, knownNames = {} }: TagInputProps) {
  const api = useApi()
  const id = useId()
  const ids = fieldIds(id)
  const listId = `${id}-lista`
  const [text, setText] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  // Nome com a caixa original de cada tag escolhida ("SynchroTDF"); o valor do campo continua sendo o slug em minúsculas.
  const [names, setNames] = useState<Record<string, string>>({})
  const nameOf = (tag: string) => names[tag] ?? knownNames[tag] ?? tag
  const slug = slugifyTag(text)
  const debounced = useDebounced(slug, 200)

  const suggestions = useQuery({
    queryKey: ['tags', debounced],
    queryFn: () => api.suggestTags(debounced),
    enabled: debounced.length > 0,
    staleTime: 30_000,
  })

  const options = (suggestions.data ?? []).filter((t) => !value.includes(t.slug)).map((t) => ({ slug: t.slug, name: t.name, create: false }))
  if (slug && isValidTag(slug) && !options.some((o) => o.slug === slug) && !value.includes(slug)) {
    options.push({ slug, name: slug, create: true })
  }
  const showList = open && slug.length > 0
  const limitReached = value.length >= LIMITS.maxTags

  function add(raw: string, name?: string) {
    const next = slugifyTag(raw)
    if (!next) return
    if (!isValidTag(next)) {
      setLocalError('Use letras, números e hífen.')
      return
    }
    if (value.includes(next)) {
      setText('')
      setLocalError(null)
      return
    }
    if (limitReached) {
      setLocalError(`Máximo de ${LIMITS.maxTags} tags.`)
      return
    }
    if (name) setNames((current) => ({ ...current, [next]: name }))
    onChange([...value, next])
    setText('')
    setLocalError(null)
    setOpen(false)
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      if (!text.trim()) {
        if (event.key === ',') event.preventDefault()
        return
      }
      event.preventDefault()
      const chosen = showList ? options[active] : undefined
      add(chosen?.slug ?? text, chosen?.name)
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setActive((a) => Math.min(a + 1, Math.max(options.length - 1, 0)))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (event.key === 'Escape' && showList) {
      event.stopPropagation()
      setOpen(false)
    } else if (event.key === 'Backspace' && !text && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  const shownError = localError ?? error
  const activeId = showList && options[active] ? `${id}-op-${active}` : undefined

  return (
    <div className={formStyles.field}>
      <label htmlFor={id} className={formStyles.label}>
        Tags<span className={formStyles.optional}> (opcional)</span>
      </label>
      {value.length > 0 ? (
        <ul className={styles.chips} aria-label="Selecionadas">
          {value.map((tag) => (
            <li key={tag} className={styles.chip}>
              <span>#{nameOf(tag)}</span>
              <button
                type="button"
                className={styles.remove}
                aria-label={`Remover tag ${nameOf(tag)}`}
                onClick={() => onChange(value.filter((t) => t !== tag))}
              >
                <Icon name="close" size={14} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className={styles.wrap}>
        <input
          id={id}
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          aria-invalid={shownError ? true : undefined}
          aria-describedby={[ids.help, shownError ? ids.error : null].filter(Boolean).join(' ')}
          autoComplete="off"
          value={text}
          placeholder={limitReached ? 'Máximo de 5 tags' : 'Digite e aperte Enter'}
          disabled={limitReached}
          className={[formStyles.input, shownError ? formStyles.invalid : ''].filter(Boolean).join(' ')}
          onChange={(e) => {
            setText(e.target.value)
            setLocalError(null)
            setActive(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
        />
        {showList ? (
          <ul id={listId} role="listbox" aria-label="Sugestões de tags" className={styles.list}>
            {suggestions.isFetching ? <li role="presentation" className={styles.note}>Buscando tags...</li> : null}
            {options.map((option, i) => (
              <li
                key={option.slug}
                id={`${id}-op-${i}`}
                role="option"
                aria-selected={i === active}
                className={[styles.option, i === active ? styles.active : ''].filter(Boolean).join(' ')}
                onMouseDown={(e) => {
                  e.preventDefault()
                  add(option.slug, option.name)
                }}
              >
                {option.create ? `Criar tag '${option.slug}'` : `#${option.name}`}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <p id={ids.help} className={formStyles.help}>
        Até {LIMITS.maxTags} tags. Ajudam outras pessoas a achar este post.
      </p>
      {shownError ? <FieldError id={ids.error}>{shownError}</FieldError> : null}
    </div>
  )
}
