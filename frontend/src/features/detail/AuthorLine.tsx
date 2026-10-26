import type { Author } from '../../api'
import { Avatar, AuthorName } from '../../components/ui/Avatar'
import { formatRelative } from '../../lib/dates'
import styles from './detail.module.css'

/** Avatar, nome (ou "Conta excluída"), "há 6 dias" e "editado há 2 dias". */
export function AuthorLine({ author, createdAt, editedAt }: { author: Author | null; createdAt: string; editedAt: string | null }) {
  return (
    <div className={styles.authorLine}>
      <Avatar name={author?.name ?? null} />
      <div>
        <p className={styles.authorName}><AuthorName name={author?.name ?? null} /></p>
        <p className="meta">
          {formatRelative(createdAt)}
          {editedAt ? ` · editado ${formatRelative(editedAt)}` : ''}
        </p>
      </div>
    </div>
  )
}
