import type { ReactNode } from 'react'
import { Button } from './Button'
import { Icon, type IconName } from './Icon'
import styles from './Feedback.module.css'

export type AlertVariant = 'info' | 'success' | 'warning' | 'error'

const ALERT_ICON: Record<AlertVariant, IconName> = { info: 'info', success: 'check', warning: 'alert', error: 'alert' }

interface AlertProps {
  variant?: AlertVariant
  children: ReactNode
  /** Erro usa role="alert"; os demais, role="status". */
  action?: ReactNode
  className?: string
}

/** Alerta em linha: sempre ícone e texto (a cor nunca é o único sinal). */
export function Alert({ variant = 'info', children, action, className }: AlertProps) {
  return (
    <div
      className={[styles.alert, styles[variant], className].filter(Boolean).join(' ')}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <Icon name={ALERT_ICON[variant]} size={20} />
      <div className={styles.alertBody}>{children}</div>
      {action}
    </div>
  )
}

/** Bloco cinza de carregamento, sem animação. */
export function Skeleton({ height = 20, width = '100%', radius }: { height?: number; width?: number | string; radius?: number }) {
  return <span className={styles.skeleton} style={{ height, width, borderRadius: radius }} aria-hidden="true" />
}

export function SkeletonList({ rows = 5, label = 'Carregando...' }: { rows?: number; label?: string }) {
  return (
    <div className={styles.skeletonList} role="status" aria-label={label} aria-busy="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={styles.skeletonRow}>
          <Skeleton height={14} width={180} />
          <Skeleton height={22} width="70%" />
          <Skeleton height={14} width="90%" />
        </div>
      ))}
    </div>
  )
}

interface StateProps {
  icon?: IconName
  title: string
  children?: ReactNode
  actions?: ReactNode
  /** Foco no título ao aparecer em página inteira. */
  headingLevel?: 1 | 2
}

/** Estado vazio e páginas de estado (sem permissão, indisponível, 404): ícone, título, texto e botões. */
export function StateBlock({ icon = 'info', title, children, actions, headingLevel = 2 }: StateProps) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2'
  return (
    <div className={styles.state}>
      <span className={styles.stateIcon}><Icon name={icon} size={48} /></span>
      <Heading className={styles.stateTitle}>{title}</Heading>
      {children ? <div className={styles.stateText}>{children}</div> : null}
      {actions ? <div className={styles.stateActions}>{actions}</div> : null}
    </div>
  )
}

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  retrying?: boolean
  headingLevel?: 1 | 2
}

export function ErrorState({ title = 'Algo deu errado', message, onRetry, retrying, headingLevel = 2 }: ErrorStateProps) {
  return (
    <div role="alert">
      <StateBlock
        icon="alert"
        title={title}
        headingLevel={headingLevel}
        actions={onRetry ? <Button variant="outline" onClick={onRetry} loading={retrying} loadingText="Tentando...">Tentar de novo</Button> : null}
      >
        <p>{message}</p>
        <p className="meta">Se o problema continuar, avise a equipe de TI.</p>
      </StateBlock>
    </div>
  )
}
