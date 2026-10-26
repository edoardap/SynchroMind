import { Icon, type IconName } from './Icon'
import type { PostKind } from '../../api'
import styles from './Badge.module.css'

type BadgeTone = 'outline' | 'primary' | 'soft' | 'dark' | 'hidden' | 'pending'

interface BadgeProps {
  tone: BadgeTone
  icon?: IconName
  children: string
}

/** Selo em pílula (design 4.6): sempre texto, e ícone nos estados importantes. */
export function Badge({ tone, icon, children }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[tone]}`}>
      {icon ? <Icon name={icon} size={14} /> : null}
      {children}
    </span>
  )
}

const KIND_LABEL: Record<PostKind, string> = { question: 'Pergunta', post: 'Post' }
const KIND_ICON: Record<PostKind, IconName> = { question: 'message', post: 'edit' }

export function kindLabel(kind: PostKind): string {
  return KIND_LABEL[kind]
}

export function KindBadge({ kind }: { kind: PostKind }) {
  return <Badge tone="outline" icon={KIND_ICON[kind]}>{KIND_LABEL[kind]}</Badge>
}

export function QuestionStateBadge({ answerCount, accepted }: { answerCount: number; accepted: boolean }) {
  if (accepted) return <Badge tone="primary" icon="check">Respondida</Badge>
  if (answerCount > 0) return <Badge tone="soft">Com respostas</Badge>
  return <Badge tone="dark">Sem respostas</Badge>
}

export function HiddenBadge() {
  return <Badge tone="hidden" icon="eyeOff">Oculto</Badge>
}

export function PendingBadge() {
  return <Badge tone="pending" icon="clock">Pedido pendente</Badge>
}
