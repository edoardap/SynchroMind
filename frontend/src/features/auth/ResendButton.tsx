import { Alert } from '../../components/ui/Feedback'
import { Button } from '../../components/ui/Button'
import { useResendLink } from './useResendLink'

/** "Enviar novo link" com mensagem em região aria-live, espera e erro (A2 e A4). */
export function ResendButton({ email }: { email: string }) {
  const { resend, sending, sent, failed, secondsLeft } = useResendLink(email)
  const waiting = secondsLeft > 0
  return (
    <>
      <div aria-live="polite">
        {sent ? <Alert variant="success">Link enviado de novo.</Alert> : null}
        {failed ? <Alert variant="error">Não foi possível enviar. Tente de novo.</Alert> : null}
      </div>
      <Button variant="outline" onClick={resend} loading={sending} loadingText="Enviando..." disabled={waiting}>
        {waiting ? `Enviar novo link (em ${secondsLeft} s)` : 'Enviar novo link'}
      </Button>
    </>
  )
}
