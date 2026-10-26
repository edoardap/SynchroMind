import { Link } from 'react-router-dom'
import { APP_INITIAL, APP_NAME } from '../config/brand'
import styles from './Brand.module.css'

/** Marca provisória: "S" em quadrado verde + nome (docs/design P-02). Troque em src/config/brand.ts. */
export function Brand({ to = '/' }: { to?: string }) {
  return (
    <Link to={to} className={styles.brand} aria-label={`${APP_NAME}, início`}>
      <span className={styles.mark} aria-hidden="true">{APP_INITIAL}</span>
      <span className={styles.name} aria-hidden="true">{APP_NAME}</span>
    </Link>
  )
}
