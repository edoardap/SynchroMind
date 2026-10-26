import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../../app/ApiContext'
import { ME_KEY } from '../../app/queryClient'
import { Button } from '../../components/ui/Button'
import { useDocumentTitle } from '../../lib/hooks'
import { ResendButton } from './ResendButton'
import styles from './auth.module.css'

/** A4: conta não confirmada. Nenhum conteúdo do fórum é carregado. */
export function BlockedPage({ email }: { email: string }) {
  useDocumentTitle('Falta confirmar o e-mail')
  const api = useApi()
  const client = useQueryClient()
  const navigate = useNavigate()

  async function switchEmail() {
    await api.logout().catch(() => undefined)
    client.clear()
    client.setQueryData(ME_KEY, null)
    navigate('/entrar', { replace: true })
  }

  return (
    <>
      <h1 className={styles.title}>Falta confirmar o e-mail</h1>
      <p>
        Falta confirmar o seu e-mail. Abra o link que enviamos para <strong>{email}</strong>.
      </p>
      <div className={styles.actions}>
        <ResendButton email={email} />
        <Button variant="text" onClick={() => void switchEmail()}>Usar outro e-mail</Button>
      </div>
    </>
  )
}
