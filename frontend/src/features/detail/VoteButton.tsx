import { useState } from 'react'
import type { VoteResult } from '../../api'
import { Icon } from '../../components/ui/Icon'
import styles from './detail.module.css'

interface VoteButtonProps {
  count: number
  voted: boolean
  /** Conteúdo do próprio usuário: só a contagem, sem botão (HU-13 crit. 4, sugestão do design P-08). */
  own: boolean
  onVote: (on: boolean) => Promise<VoteResult>
}

interface Override {
  signature: string
  count: number
  voted: boolean
}

/**
 * Voto "Foi útil" como alternância (HU-13). Atualiza na hora; se o servidor falhar, volta ao valor anterior
 * e avisa. A contagem nova é anunciada numa região aria-live.
 */
export function VoteButton({ count, voted, own, onVote }: VoteButtonProps) {
  const signature = `${count}|${voted}`
  const [override, setOverride] = useState<Override | null>(null)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const [announcement, setAnnouncement] = useState('')

  // O valor do servidor (props) volta a valer assim que muda; antes disso vale o que o clique mostrou.
  const view = override && override.signature === signature ? override : { count, voted }

  if (own) {
    const text = `${count} ${count === 1 ? 'pessoa achou' : 'pessoas acharam'} útil`
    return <p className="meta">{text}</p>
  }

  async function toggle() {
    const next = !view.voted
    setFailed(false)
    setBusy(true)
    setOverride({ signature, count: view.count + (next ? 1 : -1), voted: next })
    try {
      const result = await onVote(next)
      setOverride({ signature, count: result.vote_count, voted: result.voted_by_me })
      setAnnouncement(result.voted_by_me ? `Voto registrado. ${result.vote_count} no total.` : `Voto retirado. ${result.vote_count} no total.`)
    } catch {
      setOverride(null)
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.vote}>
      <button
        type="button"
        className={[styles.voteButton, view.voted ? styles.voteOn : ''].filter(Boolean).join(' ')}
        aria-pressed={view.voted}
        disabled={busy}
        onClick={() => void toggle()}
      >
        <Icon name={view.voted ? 'check' : 'arrowUp'} size={18} />
        {view.voted ? `Útil · ${view.count}` : `Foi útil · ${view.count}`}
      </button>
      <span className="somente-leitor" aria-live="polite">{announcement}</span>
      {failed ? <p className={styles.voteError} role="alert">Não foi possível registrar o voto. Tente de novo.</p> : null}
    </div>
  )
}
