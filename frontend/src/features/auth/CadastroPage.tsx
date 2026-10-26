import { useMutation, useQuery } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isApiError, type ApiError } from '../../api'
import { useApi } from '../../app/ApiContext'
import { Button } from '../../components/ui/Button'
import { Alert, Skeleton } from '../../components/ui/Feedback'
import { Checkbox, ErrorSummary, TextField, toSummary, useFocusFirstError } from '../../components/ui/Form'
import { EMAIL_DOMAIN } from '../../config/brand'
import { useDocumentTitle } from '../../lib/hooks'
import { fieldErrorsFrom, validateEmail, type FieldErrors } from '../../lib/validation'
import { AuthLayout } from '../../layout/AuthLayout'
import styles from './auth.module.css'

const ORDER = ['name', 'email', 'privacy']
const PRIVACY_MESSAGE = 'Para criar a conta, marque que leu o aviso.'

/** A1: cadastro com e-mail da empresa e aviso de privacidade (HU-01, HU-03). */
export function CadastroPage() {
  useDocumentTitle('Criar conta')
  const api = useApi()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [ack, setAck] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [serverFailed, setServerFailed] = useState(false)
  useFocusFirstError(errors, ORDER)

  const notice = useQuery({ queryKey: ['privacy-notice'], queryFn: () => api.getPrivacyNotice(), staleTime: Infinity })

  const create = useMutation({
    mutationFn: () =>
      api.createUser({
        name: name.trim(),
        email: email.trim(),
        accepted_privacy_notice_version: notice.data?.version ?? '',
      }),
    onSuccess: () => navigate('/verifique-seu-email', { state: { email: email.trim().toLowerCase(), mode: 'cadastro' } }),
    onError: (error) => {
      if (isApiError(error, 'email_already_registered')) {
        show({ email: 'Já existe uma conta com esse e-mail.' })
      } else if (isApiError(error) && error.status === 422) {
        show(mapValidation(error))
      } else {
        setServerFailed(true)
      }
    },
  })

  function mapValidation(error: ApiError): FieldErrors {
    const found = fieldErrorsFrom(error)
    if (found.accepted_privacy_notice_version) {
      found.privacy = PRIVACY_MESSAGE
      delete found.accepted_privacy_notice_version
    }
    return found
  }

  function show(next: FieldErrors) {
    // O foco vai ao primeiro campo com erro; o resumo no topo (role=alert) lista todos.
    setErrors(next)
    setServerFailed(false)
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    const next: FieldErrors = {}
    if (!name.trim()) next.name = 'Informe o seu nome.'
    const emailError = validateEmail(email, true)
    if (emailError) next.email = emailError
    if (!ack) next.privacy = PRIVACY_MESSAGE
    if (Object.keys(next).length > 0) {
      show(next)
      return
    }
    setErrors({})
    setServerFailed(false)
    create.mutate()
  }

  const duplicate = errors.email === 'Já existe uma conta com esse e-mail.'

  return (
    <AuthLayout>
      <h1 className={styles.title}>Criar conta</h1>
      <p className={styles.lead}>Use o seu e-mail da empresa. Enviaremos um link para confirmar.</p>
      {serverFailed ? (
        <Alert
          variant="error"
          action={<Button variant="outline" onClick={() => create.mutate()} loading={create.isPending} loadingText="Criando conta...">Tentar de novo</Button>}
        >
          Não foi possível criar a conta agora. Tente de novo em instantes.
        </Alert>
      ) : null}
      <form className={styles.form} onSubmit={submit} noValidate>
        <ErrorSummary items={toSummary(errors, ORDER)} />
        <TextField
          label="Nome"
          name="name"
          autoComplete="name"
          help="Como você quer aparecer nas suas publicações."
          value={name}
          error={errors.name}
          onChange={(e) => setName(e.target.value)}
        />
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
        {duplicate ? (
          <p className={styles.muted}>
            <Link to={{ pathname: '/entrar', search: `?email=${encodeURIComponent(email.trim())}` }}>Entrar</Link>
            {' · '}
            <Link to={{ pathname: '/entrar', search: `?email=${encodeURIComponent(email.trim())}` }}>Reenviar link de confirmação</Link>
          </p>
        ) : null}
        <section className={styles.privacy} aria-labelledby="seus-dados">
          <p id="seus-dados" className="rotulo">Seus dados</p>
          {notice.isPending ? (
            <Skeleton height={60} />
          ) : notice.isError ? (
            <Alert variant="error" action={<Button variant="outline" onClick={() => void notice.refetch()}>Tentar de novo</Button>}>
              Não foi possível carregar o aviso de privacidade.
            </Alert>
          ) : (
            <p className={styles.privacyText}>{notice.data.text}</p>
          )}
          <Checkbox
            name="privacy"
            label="Li e entendi como meus dados são usados"
            checked={ack}
            error={errors.privacy}
            onChange={(e) => setAck(e.target.checked)}
          />
        </section>
        <div className={styles.formActions}>
          <Button type="submit" size="lg" loading={create.isPending} loadingText="Criando conta..." disabled={notice.isError}>
            Criar conta
          </Button>
          <Link to="/entrar">Já tenho conta. Entrar</Link>
        </div>
      </form>
    </AuthLayout>
  )
}
