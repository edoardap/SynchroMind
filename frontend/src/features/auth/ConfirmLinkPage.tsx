import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { isApiError } from '../../api'
import { useApi } from '../../app/ApiContext'
import { ME_KEY } from '../../app/queryClient'
import { ButtonLink } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { StateBlock } from '../../components/ui/Feedback'
import { useDocumentTitle } from '../../lib/hooks'
import { AuthLayout } from '../../layout/AuthLayout'
import styles from './auth.module.css'

function readToken(hash: string): string {
  return new URLSearchParams(hash.replace(/^#/, '')).get('token') ?? ''
}

/**
 * A3: resultado do link do e-mail. O token vem no fragmento (#token=) e sai da URL antes de qualquer chamada;
 * a troca é por POST (um GET gastaria o token em scanners de e-mail).
 */
export function ConfirmLinkPage() {
  useDocumentTitle('Confirmando o e-mail')
  const api = useApi()
  const client = useQueryClient()
  const location = useLocation()
  const started = useRef(false)

  const verify = useMutation({
    mutationFn: (token: string) => api.verifyLink(token),
    onSuccess: (me) => client.setQueryData(ME_KEY, me),
  })

  const [token] = useState(() => readToken(location.hash))

  useEffect(() => {
    if (started.current) return
    started.current = true
    if (window.location.hash) window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search)
    if (token) verify.mutate(token)
    // Roda uma vez por abertura do link.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const expired = !token || isApiError(verify.error, 'link_invalid_or_expired')

  return (
    <AuthLayout>
      <div aria-live="polite" className={styles.actions}>
        {token && (verify.isPending || verify.isIdle) ? (
          <p role="status" className={styles.centered}>
            <Spinner /> Confirmando o seu e-mail...
          </p>
        ) : verify.isSuccess ? (
          <StateBlock icon="checkCircle" title="E-mail confirmado" headingLevel={1} actions={<ButtonLink to="/" size="lg">Ir para o fórum</ButtonLink>}>
            <p>Sua conta está pronta.</p>
          </StateBlock>
        ) : expired ? (
          <StateBlock
            icon="alert"
            title="Link inválido"
            headingLevel={1}
            actions={<ButtonLink to="/entrar" size="lg">Enviar novo link</ButtonLink>}
          >
            <p>Este link não vale mais. Ele pode ter expirado ou já ter sido usado.</p>
            <p><Link to="/entrar">Entrar</Link></p>
          </StateBlock>
        ) : (
          <StateBlock icon="wifiOff" title="Não deu para confirmar" headingLevel={1}>
            <p>Não conseguimos confirmar agora. Tente abrir o link de novo.</p>
          </StateBlock>
        )}
      </div>
    </AuthLayout>
  )
}
