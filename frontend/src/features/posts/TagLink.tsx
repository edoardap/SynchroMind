import { Link } from 'react-router-dom'
import type { Tag } from '../../api'
import styles from './posts.module.css'

/** Tag: link verde-escuro com "#", leva ao filtro de B1 (HU-12). */
export function TagLink({ tag }: { tag: Tag }) {
  return (
    <Link to={{ pathname: '/', search: `?tag=${encodeURIComponent(tag.slug)}` }} className={styles.tag}>
      #{tag.name}
    </Link>
  )
}

export function TagList({ tags }: { tags: Tag[] }) {
  if (tags.length === 0) return null
  return (
    <ul className={styles.tags} aria-label="Tags">
      {tags.map((tag) => (
        <li key={tag.slug}>
          <TagLink tag={tag} />
        </li>
      ))}
    </ul>
  )
}
