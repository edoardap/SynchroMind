import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { Icon, type IconName } from './Icon'
import { Spinner } from './Spinner'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'dark' | 'outline' | 'danger' | 'text'

export function buttonClass(variant: ButtonVariant = 'primary', size: 'md' | 'lg' = 'md', extra = ''): string {
  return [styles.button, styles[variant], size === 'lg' ? styles.lg : '', extra].filter(Boolean).join(' ')
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: 'md' | 'lg'
  loading?: boolean
  /** Texto de andamento ("Publicando..."), mostrado no lugar do rótulo enquanto carrega. */
  loadingText?: string
  icon?: IconName
  ref?: Ref<HTMLButtonElement>
}

export function Button({ variant = 'primary', size = 'md', loading, loadingText, icon, children, className, disabled, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass(variant, size, className)}
    >
      {loading ? <Spinner /> : icon ? <Icon name={icon} size={18} /> : null}
      {loading && loadingText ? loadingText : children}
    </button>
  )
}

interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant
  size?: 'md' | 'lg'
  icon?: IconName
  children: ReactNode
}

export function ButtonLink({ variant = 'primary', size = 'md', icon, children, className, ...rest }: ButtonLinkProps) {
  return (
    <Link {...rest} className={buttonClass(variant, size, className)}>
      {icon ? <Icon name={icon} size={18} /> : null}
      {children}
    </Link>
  )
}
