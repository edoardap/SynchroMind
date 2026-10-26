import { initials } from '../../lib/text'
import { Icon } from './Icon'
import styles from './Avatar.module.css'

interface AuthorProps {
  name: string | null
  size?: number
}

/** Avatar com iniciais. Autor de conta excluída: círculo cinza com ícone de pessoa (2.6). */
export function Avatar({ name, size = 34 }: AuthorProps) {
  if (name === null) {
    return (
      <span className={`${styles.avatar} ${styles.deleted}`} style={{ width: size, height: size }} aria-hidden="true">
        <Icon name="user" size={Math.round(size * 0.55)} />
      </span>
    )
  }
  return (
    <span className={styles.avatar} style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }} aria-hidden="true">
      {initials(name)}
    </span>
  )
}

/** Nome do autor, ou "Conta excluída" (texto, sem link). O leitor de tela lê "Autor: conta excluída". */
export function AuthorName({ name }: { name: string | null }) {
  if (name === null) {
    return (
      <span>
        <span className="somente-leitor">Autor: </span>
        <span>Conta excluída</span>
      </span>
    )
  }
  return <span>{name}</span>
}
