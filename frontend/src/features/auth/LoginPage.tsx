import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useApi } from '../../app/ApiContext'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Feedback'
import { ErrorSummary, TextField, toSummary, useFocusFirstError } from '../../components/ui/Form'
import { EMAIL_DOMAIN } from '../../config/brand'
import { useDocumentTitle } from '../../lib/hooks'
import { validateEmail, type FieldErrors } from '../../lib/validation'
import { AuthLayout } from '../../layout/AuthLayout'
import styles from './auth.module.css'

const ORDER = ['email']

/**
 * A5: entrar por link enviado ao e-mail (ADR-0003). A resposta é a mesma para qualquer e-mail,
 * com ou sem conta, para não revelar quem tem conta.
 */
export function LoginPage() {
  useDocumentTitle('Entrar')
  const api = useApi()
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const expired = (location.state as { expired?: boolean } | null)?.expired === true
  const [email, setEmail] = useState(params.get('email') ?? '')
  const [errors, setErrors] = useState<FieldErrors>({})
  useFocusFirstError(errors, ORDER)

  const send = useMutation({
    mutationFn: () => api.requestLink(email.trim()),
    onSuccess: () => navigate('/verifique-seu-email', { state: { email: email.trim().toLowerCase(), mode: 'login' } }),
  })

  function submit(event: FormEvent) {
    event.preventDefault()
    const error = validateEmail(email)
    if (error) {
      setErrors({ email: error })
      return
    }
    setErrors({})
    send.mutate()
  }

  return (
    <AuthLayout>
      <h1 className={styles.title}>Entrar</h1>
      {expired ? <Alert variant="warning">Sua sessão acabou. Entre de novo para continuar.</Alert> : null}
      <p className={styles.lead}>Informe o seu e-mail da empresa. Enviaremos um link de acesso.</p>
      {send.isError ? <Alert variant="error">Não foi possível enviar o link agora. Tente de novo em instantes.</Alert> : null}
      <form className={styles.form} onSubmit={submit} noValidate>
        <ErrorSummary items={toSummary(errors, ORDER)} />
        <TextField
          label="E-mail da empresa"
          name="email"
          type="email"
          autoComplete="email"
          placeholder={`nome@${EMAIL_DOMAIN}`}
          value={email}
          error={errors.email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className={styles.formActions}>
          <Button type="submit" size="lg" loading={send.isPending} loadingText="Enviando...">Enviar link de acesso</Button>
          <Link to="/cadastro">Criar conta</Link>
        </div>
      </form>
    </AuthLayout>
  )
}
