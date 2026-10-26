import { Link, Navigate, useLocation } from 'react-router-dom'
import { useDocumentTitle } from '../../lib/hooks'
import { AuthLayout } from '../../layout/AuthLayout'
import { ResendButton } from './ResendButton'
import styles from './auth.module.css'

interface VerifyState {
  email?: string
  mode?: 'cadastro' | 'login'
}

/**
 * A2: "Confirme o seu e-mail". Serve ao cadastro e à entrada por link (A5).
 * O prazo de validade do link é "A definir" (HU-02, critério 4): nenhum número é escrito aqui.
 */
export function VerifyEmailPage() {
  useDocumentTitle('Confirme o seu e-mail')
  const location = useLocation()
  const state = (location.state ?? {}) as VerifyState
  if (!state.email) return <Navigate to="/cadastro" replace />
  const login = state.mode === 'login'

  return (
    <AuthLayout>
      <h1 className={styles.title}>{login ? 'Veja o seu e-mail' : 'Confirme o seu e-mail'}</h1>
      {login ? (
        <>
          <p>Se existir uma conta com esse e-mail, enviamos um link de acesso.</p>
          <p>
            Enviado para <strong>{state.email}</strong>. Se é o seu primeiro acesso, o link também confirma o e-mail.
          </p>
        </>
      ) : (
        <p>
          Enviamos um link para <strong>{state.email}</strong>. Clique nele para liberar o acesso.
        </p>
      )}
      <p className={styles.muted}>Não chegou? Veja a caixa de spam.</p>
      <div className={styles.actions}>
        <ResendButton email={state.email} />
        <Link to={login ? '/entrar' : '/cadastro'}>Corrigir o e-mail</Link>
      </div>
    </AuthLayout>
  )
}
