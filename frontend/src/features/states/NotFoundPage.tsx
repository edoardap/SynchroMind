import { ButtonLink } from '../../components/ui/Button'
import { StateBlock } from '../../components/ui/Feedback'
import { useDocumentTitle } from '../../lib/hooks'
import { AuthLayout } from '../../layout/AuthLayout'

export function NotFoundPage() {
  useDocumentTitle('Página não encontrada')
  return (
    <AuthLayout>
      <StateBlock icon="search" title="Não encontramos esta página." headingLevel={1} actions={<ButtonLink to="/">Voltar ao início</ButtonLink>} />
    </AuthLayout>
  )
}

/** Link de publicação oculta ou inexistente: mesmo texto nos dois casos, para não revelar o que foi ocultado (2.5). */
export function ContentUnavailable() {
  useDocumentTitle('Publicação indisponível')
  return (
    <StateBlock icon="eyeOff" title="Esta publicação não está disponível." headingLevel={1} actions={<ButtonLink to="/">Voltar ao início</ButtonLink>}>
      <p>Ela pode ter sido ocultada ou removida.</p>
    </StateBlock>
  )
}
