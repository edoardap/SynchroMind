import { useId, useState, type ReactNode } from 'react'
import { FieldError, fieldIds } from './Form'
import formStyles from './Form.module.css'
import styles from './Combobox.module.css'

interface ComboboxProps<T> {
  label: string
  name?: string
  help?: ReactNode
  error?: string
  placeholder?: string
  /** Campo opcional: o rótulo diz "(opcional)" e o leitor de tela não o anuncia como obrigatório. */
  optional?: boolean
  /** Opções já filtradas por quem usa o componente (local ou vindas da API). */
  items: T[]
  itemKey: (item: T) => string
  itemLabel: (item: T) => string
  itemDescription?: (item: T) => string | undefined
  selected: T | null
  onSelect: (item: T | null) => void
  query: string
  onQueryChange: (query: string) => void
  loading?: boolean
  loadingText?: string
  emptyText?: string
  disabled?: boolean
}

/** Lista suspensa com busca (padrão combobox com lista): setas, Enter escolhe, Esc fecha. */
export function Combobox<T>({
  label, name, help, error, placeholder, optional, items, itemKey, itemLabel, itemDescription, selected, onSelect,
  query, onQueryChange, loading, loadingText = 'Carregando...', emptyText = 'Nenhum resultado.', disabled,
}: ComboboxProps<T>) {
  const id = useId()
  const listId = `${id}-lista`
  const ids = fieldIds(id)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)

  const showList = open && !disabled
  const activeId = showList && items[active] ? `${id}-op-${active}` : undefined

  function choose(item: T) {
    onSelect(item)
    onQueryChange(itemLabel(item))
    setOpen(false)
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setActive((a) => (items.length ? Math.min(a + 1, items.length - 1) : 0))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (event.key === 'Enter' && showList) {
      const item = items[active]
      if (item) {
        event.preventDefault()
        choose(item)
      }
    } else if (event.key === 'Escape' && showList) {
      event.stopPropagation()
      setOpen(false)
    }
  }

  return (
    <div className={formStyles.field}>
      <label htmlFor={id} className={formStyles.label}>
        {label}
        {optional ? <span className={formStyles.optional}> (opcional)</span> : null}
      </label>
      <div className={styles.wrap}>
        <input
          id={id}
          name={name}
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          aria-required={optional ? undefined : true}
          aria-invalid={error ? true : undefined}
          aria-describedby={[help ? ids.help : null, error ? ids.error : null].filter(Boolean).join(' ') || undefined}
          autoComplete="off"
          disabled={disabled}
          placeholder={placeholder}
          value={query}
          className={[formStyles.input, error ? formStyles.invalid : ''].filter(Boolean).join(' ')}
          onChange={(e) => {
            onQueryChange(e.target.value)
            if (selected) onSelect(null)
            setActive(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
        />
        {showList ? (
          <ul id={listId} role="listbox" aria-label={label} className={styles.list}>
            {loading ? (
              <li className={styles.note} role="presentation">{loadingText}</li>
            ) : items.length === 0 ? (
              <li className={styles.note} role="presentation">{emptyText}</li>
            ) : (
              items.map((item, i) => (
                <li
                  key={itemKey(item)}
                  id={`${id}-op-${i}`}
                  role="option"
                  aria-selected={i === active}
                  className={[styles.option, i === active ? styles.active : ''].filter(Boolean).join(' ')}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    choose(item)
                  }}
                >
                  <span>{itemLabel(item)}</span>
                  {itemDescription?.(item) ? <span className="meta">{itemDescription(item)}</span> : null}
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>
      {help ? <p id={ids.help} className={formStyles.help}>{help}</p> : null}
      {error ? <FieldError id={ids.error}>{error}</FieldError> : null}
    </div>
  )
}
