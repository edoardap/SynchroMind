import { ButtonLink } from '../../components/ui/Button'
import { StateBlock } from '../../components/ui/Feedback'
import { useDocumentTitle } from '../../lib/hooks'

/** Mesmo componente para qualquer rota restrita (D1, "Sem permissão"). */
export function PermissionDenied() {
  useDocumentTitle('Sem permissão')
  return (
    <StateBlock icon="eyeOff" title="Você não tem acesso a esta página" headingLevel={1} actions={<ButtonLink to="/">Voltar ao início</ButtonLink>}>
      <p>Esta área é só para administradores.</p>
    </StateBlock>
  )
}
