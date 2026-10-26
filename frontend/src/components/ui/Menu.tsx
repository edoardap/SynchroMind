import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Icon, type IconName } from './Icon'
import styles from './Menu.module.css'

export interface MenuItem {
  label: string
  icon?: IconName
  onSelect: () => void
  disabled?: boolean
  danger?: boolean
}

interface MenuProps {
  /** Conteúdo do botão que abre o menu. */
  trigger: ReactNode
  /** Rótulo acessível do botão. Obrigatório quando o botão só tem ícone. */
  label: string
  items: MenuItem[]
  align?: 'start' | 'end'
  className?: string
  triggerClassName?: string
}

/**
 * Menu de ações: abre com Enter, Espaço ou seta; setas navegam; Esc fecha e devolve o foco ao botão.
 */
export function Menu({ trigger, label, items, align = 'end', className, triggerClassName }: MenuProps) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const wrapRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    itemRefs.current[active]?.focus()
  }, [open, active])

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  const enabled = items.map((item, i) => (item.disabled ? -1 : i)).filter((i) => i >= 0)

  function openAt(index: number) {
    setActive(index)
    setOpen(true)
  }

  function close() {
    setOpen(false)
    buttonRef.current?.focus()
  }

  function onButtonKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      openAt(enabled[0] ?? 0)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      openAt(enabled[enabled.length - 1] ?? 0)
    }
  }

  function onMenuKeyDown(event: React.KeyboardEvent) {
    const pos = enabled.indexOf(active)
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive(enabled[(pos + 1) % enabled.length] ?? 0)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive(enabled[(pos - 1 + enabled.length) % enabled.length] ?? 0)
    } else if (event.key === 'Home') {
      event.preventDefault()
      setActive(enabled[0] ?? 0)
    } else if (event.key === 'End') {
      event.preventDefault()
      setActive(enabled[enabled.length - 1] ?? 0)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      close()
    } else if (event.key === 'Tab') {
      setOpen(false)
    }
  }

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')} ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        className={[styles.trigger, triggerClassName].filter(Boolean).join(' ')}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={label}
        onClick={() => (open ? setOpen(false) : openAt(enabled[0] ?? 0))}
        onKeyDown={onButtonKeyDown}
      >
        {trigger}
      </button>
      {open ? (
        // eslint-disable-next-line jsx-a11y/interactive-supports-focus -- o foco fica nos itens (roving), não no contêiner
        <div
          id={menuId}
          role="menu"
          aria-label={label}
          className={[styles.menu, align === 'end' ? styles.end : styles.start].join(' ')}
          onKeyDown={onMenuKeyDown}
        >
          {items.map((item, i) => (
            <button
              key={item.label}
              ref={(el) => { itemRefs.current[i] = el }}
              type="button"
              role="menuitem"
              tabIndex={i === active ? 0 : -1}
              disabled={item.disabled}
              aria-disabled={item.disabled || undefined}
              className={[styles.item, item.danger ? styles.danger : ''].filter(Boolean).join(' ')}
              onClick={() => {
                setOpen(false)
                item.onSelect()
              }}
            >
              {item.icon ? <Icon name={item.icon} size={18} /> : null}
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
