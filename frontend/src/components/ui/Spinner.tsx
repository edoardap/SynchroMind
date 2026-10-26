import styles from './Spinner.module.css'

/** Indicador de carregando (20 px). Sempre vem junto de um texto de andamento. */
export function Spinner() {
  return <span className={styles.spinner} aria-hidden="true" />
}
