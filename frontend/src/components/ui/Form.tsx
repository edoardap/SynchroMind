import { useEffect, useId, type InputHTMLAttributes, type ReactNode, type Ref, type TextareaHTMLAttributes } from 'react'
import { Icon } from './Icon'
import styles from './Form.module.css'

interface ShellProps {
  id: string
  label: string
  help?: ReactNode
  error?: string
  optional?: boolean
  counter?: { length: number; max: number }
  children: ReactNode
}

export function fieldIds(id: string) {
  return { help: `${id}-ajuda`, error: `${id}-erro` }
}

export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className={styles.error}>
      <Icon name="alert" size={16} />
      <span>{children}</span>
    </p>
  )
}

function FieldShell({ id, label, help, error, optional, counter, children }: ShellProps) {
  const ids = fieldIds(id)
  const showCounter = counter && counter.length >= counter.max * 0.8
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {optional ? <span className={styles.optional}> (opcional)</span> : null}
      </label>
      {children}
      {help ? <p id={ids.help} className={styles.help}>{help}</p> : null}
      {showCounter ? (
        <p className={styles.counter} aria-live="polite">
          {counter.length.toLocaleString('pt-BR')} / {counter.max.toLocaleString('pt-BR')}
        </p>
      ) : null}
      {error ? <FieldError id={ids.error}>{error}</FieldError> : null}
    </div>
  )
}

function describedBy(id: string, help: ReactNode, error?: string) {
  const ids = fieldIds(id)
  return [help ? ids.help : null, error ? ids.error : null].filter(Boolean).join(' ') || undefined
}

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string
  help?: ReactNode
  error?: string
  optional?: boolean
  /** Campo em pílula (busca e título). */
  pill?: boolean
  ref?: Ref<HTMLInputElement>
}

export function TextField({ label, help, error, optional, pill, className, ref, ...rest }: TextFieldProps) {
  const id = useId()
  return (
    <FieldShell id={id} label={label} help={help} error={error} optional={optional}>
      <input
        {...rest}
        ref={ref}
        id={id}
        aria-required={optional ? undefined : true}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, help, error)}
        className={[styles.input, pill ? styles.pill : '', error ? styles.invalid : '', className].filter(Boolean).join(' ')}
      />
    </FieldShell>
  )
}

interface TextAreaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  label: string
  help?: ReactNode
  error?: string
  optional?: boolean
  maxLength?: number
  ref?: Ref<HTMLTextAreaElement>
}

export function TextAreaField({ label, help, error, optional, rows = 5, maxLength, value, className, ref, ...rest }: TextAreaFieldProps) {
  const id = useId()
  const length = typeof value === 'string' ? value.length : 0
  return (
    <FieldShell
      id={id}
      label={label}
      help={help}
      error={error}
      optional={optional}
      counter={maxLength ? { length, max: maxLength } : undefined}
    >
      <textarea
        {...rest}
        ref={ref}
        id={id}
        rows={rows}
        value={value}
        aria-required={optional ? undefined : true}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, help, error)}
        className={[styles.input, styles.area, error ? styles.invalid : '', className].filter(Boolean).join(' ')}
      />
    </FieldShell>
  )
}

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> {
  label: ReactNode
  error?: string
}

export function Checkbox({ label, error, className, ...rest }: CheckboxProps) {
  const id = useId()
  const ids = fieldIds(id)
  return (
    <div className={styles.field}>
      <div className={styles.choice}>
        <input
          {...rest}
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? ids.error : undefined}
          className={[styles.check, className].filter(Boolean).join(' ')}
        />
        <label htmlFor={id}>{label}</label>
      </div>
      {error ? <FieldError id={ids.error}>{error}</FieldError> : null}
    </div>
  )
}

interface RadioOption<V extends string> {
  value: V
  label: string
  help?: string
}

interface RadioGroupProps<V extends string> {
  legend: string
  name: string
  options: RadioOption<V>[]
  value: V | ''
  onChange: (value: V) => void
  error?: string
}

export function RadioGroup<V extends string>({ legend, name, options, value, onChange, error }: RadioGroupProps<V>) {
  const id = useId()
  const ids = fieldIds(id)
  return (
    <fieldset className={styles.fieldset} aria-describedby={error ? ids.error : undefined}>
      <legend className={styles.label}>{legend}</legend>
      {options.map((option) => (
        <label key={option.value} className={styles.choice}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className={styles.radio}
          />
          <span>{option.label}</span>
        </label>
      ))}
      {error ? <FieldError id={ids.error}>{error}</FieldError> : null}
    </fieldset>
  )
}

export interface ErrorSummaryItem {
  name: string
  message: string
}

interface ErrorSummaryProps {
  title?: string
  items: ErrorSummaryItem[]
  ref?: Ref<HTMLDivElement>
}

/** Resumo no topo do formulário: diz quais campos precisam de atenção e leva a eles. */
export function ErrorSummary({ title = 'Corrija os campos abaixo para continuar:', items, ref }: ErrorSummaryProps) {
  if (items.length === 0) return null
  return (
    <div ref={ref} role="alert" tabIndex={-1} className={styles.summary}>
      <p className={styles.summaryTitle}>
        <Icon name="alert" size={18} /> {title}
      </p>
      <ul>
        {items.map((item) => (
          <li key={item.name}>
            <a
              href={`#${item.name}`}
              onClick={(event) => {
                event.preventDefault()
                document.getElementsByName(item.name)[0]?.focus()
              }}
            >
              {item.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Monta os itens do resumo de erros na ordem dos campos. */
export function toSummary(errors: Record<string, string>, order: string[]): ErrorSummaryItem[] {
  return order.filter((name) => errors[name]).map((name) => ({ name, message: errors[name] as string }))
}

/** Foca o primeiro campo (pelo atributo name) que tem erro. */
export function focusFirstInvalid(names: string[]) {
  for (const name of names) {
    const el = document.getElementsByName(name)[0]
    if (el) {
      el.focus()
      return
    }
  }
}

/** Depois de um envio com erro, leva o foco ao primeiro campo (na ordem dada) que tem erro. */
export function useFocusFirstError(errors: Record<string, string>, order: string[]) {
  useEffect(() => {
    focusFirstInvalid(order.filter((name) => errors[name]))
    // `order` é uma constante da tela; só reage quando o conjunto de erros muda.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors])
}
