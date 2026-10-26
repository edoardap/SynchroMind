import { useId } from 'react'
import styles from './FilterToggle.module.css'

interface Option<V extends string> {
  value: V
  label: string
}

interface FilterToggleProps<V extends string> {
  legend: string
  options: Option<V>[]
  value: V
  onChange: (value: V) => void
}

/** Alternância em pílulas ("Abertas" / "Resolvidas"), como grupo de botões de rádio. */
export function FilterToggle<V extends string>({ legend, options, value, onChange }: FilterToggleProps<V>) {
  const name = useId()
  return (
    <fieldset className={styles.set}>
      <legend className="somente-leitor">{legend}</legend>
      {options.map((option) => (
        <label key={option.value} className={styles.option}>
          <input type="radio" name={name} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} className={styles.input} />
          <span className={styles.label}>{option.label}</span>
        </label>
      ))}
    </fieldset>
  )
}
