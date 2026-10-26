import type { HiddenInfo } from '../../api'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { formatShortDate } from '../../lib/dates'
import styles from './detail.module.css'

interface HiddenBannerProps {
  hidden: HiddenInfo
  isAdmin: boolean
  restoring?: boolean
  onRestore?: () => void
}

/** Faixa de conteúdo oculto (2.5): o admin vê quem ocultou e restaura; o autor vê a explicação. */
export function HiddenBanner({ hidden, isAdmin, restoring, onRestore }: HiddenBannerProps) {
  return (
    <div className={styles.hiddenBanner}>
      <Icon name="eyeOff" size={20} />
      <p>
        {isAdmin
          ? `Oculto${hidden.by ? ` por ${hidden.by.name}` : ''} em ${formatShortDate(hidden.at)}`
          : 'Este conteúdo foi ocultado pelos administradores e não aparece para outras pessoas. Se acha que foi engano, fale com um administrador.'}
      </p>
      {isAdmin && onRestore ? (
        <Button variant="outline" onClick={onRestore} loading={restoring} loadingText="Restaurando..." icon="restore">Restaurar</Button>
      ) : null}
    </div>
  )
}
