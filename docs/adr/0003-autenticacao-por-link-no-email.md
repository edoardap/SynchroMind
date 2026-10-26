# ADR-0003: Autenticar por link enviado ao e-mail, sem senha, com sessão em cookie

- **Status:** Proposto
- **Data:** 2026-10-26
- **Decisores:** Equipe Synpower (a confirmar)

## Contexto
O cadastro recebe só nome e e-mail (HU-01) e a conta só libera acesso após confirmar o e-mail por link (RF-01, RNF-01). O PRD não menciona senha e limita os dados pessoais a nome e e-mail (RNF-04). O domínio de e-mail vem da TI. Não se sabe se a empresa tem um provedor de identidade (Google Workspace, Microsoft Entra) disponível para login único.

## Decisão
Não haverá senha. O mesmo mecanismo de link de uso único, enviado ao e-mail, confirma a conta no primeiro acesso e autentica nos acessos seguintes. A autenticação abre uma sessão no servidor, identificada por um cookie opaco `HttpOnly`, `Secure`, `SameSite=Lax`. O token do link é aleatório (256 bits), guardado só como hash, de uso único e com validade curta. O link abre uma página do frontend que envia o token por POST, nunca consome o token num GET.

## Alternativas consideradas
- **Senha mais link de confirmação:** conhecida por todos, mas cria um segredo para guardar (hash), recuperação de senha por e-mail de qualquer forma e política de senha. Mais código e mais superfície para o mesmo e-mail que já é a prova de identidade. Descartada.
- **Login único (OIDC com o provedor da empresa):** melhor experiência e remove o envio de e-mail no login, mas depende de um provedor que ninguém confirmou e conflita com o fluxo de RF-01 (confirmar por link). Vira a alternativa preferida se a TI confirmar o provedor.
- **JWT sem estado no navegador:** sem consulta ao banco, mas não permite encerrar a sessão ao excluir a conta (RF-15) sem lista de revogação. Com poucas centenas de usuários, a sessão no banco custa pouco. Descartada.

## Consequências
- **Positivas:** nada de senha para vazar ou resetar; o armazenamento continua só nome e e-mail; excluir a conta encerra todas as sessões por cascata.
- **Negativas / custos:** todo login depende da entrega do e-mail (atraso do relay, filtro de spam); exige limite de pedidos de link por e-mail e por IP; a validade do link precisa de equilíbrio entre conforto e segurança. Valores provisórios a confirmar: confirmação de cadastro 24 h, link de login 15 min, sessão deslizante com duração A definir.
- **Riscos e gatilho de revisão:** quem controla a caixa de e-mail controla a conta. Revisar se a TI tiver login único corporativo, ou se a entrega de e-mail se mostrar instável.

## Questões em aberto
- A empresa tem provedor de identidade para login único? (TI)
- Validade do link de confirmação e duração da sessão (HU-02, critério 4): confirmar os valores provisórios.

## Relacionados
- ADR-0006 (envio do e-mail); RF-01, HU-01, HU-02; RNF-01, RNF-04.
