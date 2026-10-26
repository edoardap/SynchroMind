import type { ReactNode } from 'react'

/** Ícones de linha, traço arredondado de 2 px (P-17). Decorativos por padrão (aria-hidden). */
const PATHS: Record<string, ReactNode> = {
  search: (<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  more: (<><circle cx="5" cy="12" r="1.6" fill="currentColor" /><circle cx="12" cy="12" r="1.6" fill="currentColor" /><circle cx="19" cy="12" r="1.6" fill="currentColor" /></>),
  arrowUp: <path d="M12 19V5M5 12l7-7 7 7" />,
  check: <path d="M20 6 9 17l-5-5" />,
  edit: <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />,
  flag: <path d="M4 22V4M4 4h13l-2 4 2 4H4" />,
  eyeOff: <path d="M17.9 17.9A10 10 0 0 1 12 20C5 20 1 12 1 12a18 18 0 0 1 5-5.9M9.9 4.2A9 9 0 0 1 12 4c7 0 11 8 11 8a18 18 0 0 1-2.2 3.2M1 1l22 22M14.1 14.1a3 3 0 1 1-4.2-4.2" />,
  clock: (<><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>),
  alert: <path d="m10.3 3.9-8.5 14.1A2 2 0 0 0 3.5 21h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0ZM12 9v4M12 17h.01" />,
  user: (<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>),
  users: (<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>),
  close: <path d="M18 6 6 18M6 6l12 12" />,
  plus: <path d="M12 5v14M5 12h14" />,
  info: (<><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></>),
  chevronDown: <path d="m6 9 6 6 6-6" />,
  filter: <path d="M4 6h16M7 12h10M10 18h4" />,
  message: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />,
  checkCircle: (<><circle cx="12" cy="12" r="10" /><path d="m8 12 3 3 5-6" /></>),
  wifiOff: <path d="M1 1l22 22M16.7 11.1A11 11 0 0 1 21 13.5M5 13.5a11 11 0 0 1 5.2-2.3M8.5 16.4a6 6 0 0 1 7 0M12 20h.01M1.4 8.8A16 16 0 0 1 6 6.3M10.7 5.1A16 16 0 0 1 22.6 8.8" />,
  restore: <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" />,
}

export type IconName = keyof typeof PATHS

interface IconProps {
  name: IconName
  size?: number
  /** Só para ícone que age sozinho sem texto próximo. */
  label?: string
}

export function Icon({ name, size = 20, label }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      focusable="false"
      style={{ flexShrink: 0 }}
    >
      {PATHS[name]}
    </svg>
  )
}
