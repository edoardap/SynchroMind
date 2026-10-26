import { useRef, type ReactNode } from 'react'
import styles from './Tabs.module.css'

export interface TabDef {
  id: string
  label: string
}

interface TabsProps {
  label: string
  tabs: TabDef[]
  active: string
  onChange: (id: string) => void
  /** Conteúdo do painel ativo. */
  children: ReactNode
  idPrefix?: string
}

/** Abas com role="tablist"; setas, Home e End navegam; só a aba ativa entra na ordem do Tab. */
export function Tabs({ label, tabs, active, onChange, children, idPrefix = 'aba' }: TabsProps) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({})

  function onKeyDown(event: React.KeyboardEvent, index: number) {
    let next = -1
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length
    else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = tabs.length - 1
    if (next < 0) return
    event.preventDefault()
    const target = tabs[next]
    if (!target) return
    onChange(target.id)
    refs.current[target.id]?.focus()
  }

  return (
    <div>
      <div role="tablist" aria-label={label} className={styles.list}>
        {tabs.map((tab, i) => {
          const selected = tab.id === active
          return (
            <button
              key={tab.id}
              ref={(el) => { refs.current[tab.id] = el }}
              role="tab"
              type="button"
              id={`${idPrefix}-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${idPrefix}-painel`}
              tabIndex={selected ? 0 : -1}
              className={[styles.tab, selected ? styles.active : ''].filter(Boolean).join(' ')}
              onClick={() => onChange(tab.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
      <div role="tabpanel" id={`${idPrefix}-painel`} aria-labelledby={`${idPrefix}-${active}`} className={styles.panel}>
        {children}
      </div>
    </div>
  )
}
