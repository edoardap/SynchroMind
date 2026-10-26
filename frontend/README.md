# Fórum interno de conhecimento: frontend

Interface (React, TypeScript e Vite) do fórum interno. O backend (Python/FastAPI) ainda não existe: as telas falam com uma
camada de dados em memória, com dados de exemplo, que depois é trocada pelo cliente real da API sem mexer nas telas.

Fontes da especificação: `../docs/design/forum-conhecimento.md` (telas, estados, tokens), `../docs/planejamento/forum-conhecimento.md`
(HU-01 a HU-18) e `../docs/arquitetura/forum-conhecimento.md` (contrato da API, seção 5).

## Instalar, rodar e testar

Requisitos: Node 24 e npm 11 (as versões usadas no desenvolvimento).

```bash
npm install          # instala as dependências (versões fixas no package.json)
npm run dev          # servidor de desenvolvimento em http://localhost:5173
npm test             # testes de tela (Vitest e Testing Library), uma vez
npm run test:watch   # testes em modo contínuo
npm run lint         # ESLint (inclui regras de acessibilidade jsx-a11y)
npm run typecheck    # checagem de tipos
npm run build        # checagem de tipos e build de produção em dist/
npm run preview      # serve o build
```

## Como ver as telas

Sem backend, a camada em memória (`src/api/memory/`) responde com dados de exemplo fictícios (`seed.ts`, marcados como exemplo).
O estado vive só na memória da aba: recarregar a página volta aos dados iniciais.

No canto inferior esquerdo há o controle **Perfil de teste**, que troca quem está usando o fórum:

| Perfil | O que mostra |
| -- | -- |
| Usuário comum (Marina Souza) | Fórum completo, sem a administração; "Sem permissão" em `/admin` |
| Admin (Helena Duarte) | Item "Administração", ocultar, restaurar, denúncias, promover, pedidos de exclusão |
| Sem login | Redireciona para "Entrar" (A5) |
| E-mail não confirmado | Tela "Falta confirmar o e-mail" (A4) |

O perfil escolhido fica no `sessionStorage` da aba. O controle só existe quando a camada de dados é a em memória.

Link de confirmação de e-mail (A3): abra `/confirmar#token=exemplo-valido` para ver o sucesso; qualquer outro valor mostra "link expirado ou já usado".

## Estrutura

```text
src/
  api/              contrato da API: types.ts (tipos), client.ts (interface ForumApi), errors.ts (ApiError), index.ts (escolha da implementação)
    memory/         implementação em memória (memoryApi.ts) e dados de exemplo (seed.ts)
  app/              roteador (routes.tsx), sessão (auth.tsx), providers, cache (queryClient.ts)
  components/ui/    componentes pequenos e reutilizáveis: Button, Form, Dialog, Menu, Tabs, Toast, Combobox, Badge, Avatar, Feedback...
  config/brand.ts   nome provisório do produto, domínio de e-mail e limites a definir
  features/         uma pasta por área: auth, home, publish, detail, account, admin, tags, posts, states
  layout/           cabeçalho, menu e botão "Publicar" do celular, controle de perfil de teste
  lib/              texto, datas, validação, hooks
  styles/           tokens.css (design tokens), fonts.css (Urbanist), base.css
  test/             render.tsx (renderApp), matchers
```

Tokens do design system IDE.IA em CSS variables (`src/styles/tokens.css`), com as correções de contraste da especificação
(texto escuro sobre o verde, verde mais escuro `#2F6F37` para tags e links, bordas de campo `#8A8A8A`, foco em `#22212C`).

### Trocar o nome do produto

Edite `APP_NAME` e `APP_INITIAL` em `src/config/brand.ts`. Cabeçalho, título da página e texto alternativo da marca leem de lá
(o `<title>` inicial e o favicon, em `index.html` e `public/favicon.svg`, são estáticos).

## Trocar a camada de dados pela API real

Toda tela usa a interface `ForumApi` (`src/api/client.ts`) pelo hook `useApi()`. Cada método corresponde a uma rota de `/api/v1`
do contrato (o comentário ao lado de cada método diz qual). Para ligar ao backend:

1. Crie `src/api/http/httpApi.ts` com um objeto que satisfaça `ForumApi`. Pode ser o cliente gerado do OpenAPI do FastAPI
   embrulhado num adaptador, ou `fetch` direto. Requisitos do contrato: `credentials: 'include'` (cookie de sessão),
   JSON UTF-8, erros no formato `{"error": {"code", "message", "details"}}` convertidos em `ApiError(status, code, message, details)`
   (`src/api/errors.ts`), e `GET /me/deletion-request` com 404 convertido em `null`.
2. Em `src/api/index.ts`, exporte `api` apontando para o novo objeto e remova `devTools` (o controle de perfil some junto).
3. Apague `src/api/memory/` quando não precisar mais dos dados de exemplo (os testes de tela usam a camada em memória; troque
   `src/test/render.tsx` por um servidor simulado, como o MSW, se quiser testar contra HTTP).

Pontos do contrato que a interface assume e merecem conferência quando o backend existir (marcados em `src/api/types.ts`):
`admin_since` em `/admin/users`, `hidden` (`at` e `by`) nas listas e no detalhe para admin e autor, `target_kind` e `post_id`
nas denúncias, e `listReports('open' | 'resolved')` mapeando `open` e `actioned` mais `dismissed`.

## Tipos de conteúdo e botões do cabeçalho

Por decisão do usuário (2026-10-26), o tipo "problema e solução" foi **unificado em "post"**: texto livre, sobre qualquer tema da
empresa. O "post em nome de um time" deixou de ser um tipo: é um post com o seletor opcional "Publicar em nome de um time"
(vazio por padrão). Sobram dois tipos, `post` e `question`, e os filtros da lista são Todos, Perguntas e Posts. A interface
da camada de dados (`src/api/types.ts`) já segue isso, e `docs/arquitetura/forum-conhecimento.md` foi atualizado para o mesmo contrato
(`PostKind = 'post' | 'question'`, sem `problem` e `solution`, `team_id` opcional só em `post`, `kind` e `team_id` fixos na edição).

O cabeçalho tem dois botões separados: **Fazer uma pergunta** (primário, verde) e **Criar um post** (secundário, de contorno).
No celular, o botão flutuante "Publicar" abre uma folha com as mesmas duas ações. Não há mais o menu "Compartilhar".

## Tags de exemplo

Os dados de exemplo usam só estas tags, com o padrão de nome "Synchro" em caixa de título seguido da sigla (decisão do usuário): `IA`, `Synchro4me`, `SynchroTDF`, `ETA`, `Corporativo` e `SynchroDFE`.
Elas aparecem nos filtros da página inicial, nas sugestões do campo de tags e nos posts de exemplo (`src/api/memory/seed.ts`).
A tag não diferencia maiúsculas e minúsculas: o contrato tem `slug` em minúsculas (usado na URL, na busca e no filtro) e `name`
com a caixa original (usado na tela). Tags novas criadas ao publicar continuam permitidas (HU-11).

## O que está implementado

Cadastro (A1), confirmação de e-mail (A2, A3, A4), entrar por link (A5), início com busca, filtros e "Carregar mais" (B1),
criar um post (B2: um formulário só, com Título, Texto, tags e, se quiser, "Publicar em nome de um time"), fazer uma pergunta
(B3, com "Talvez já esteja respondido"), detalhe com respostas, votos e resposta aceita (B5, B6), editar (B7), denunciar (B8), minhas publicações (B9), minha conta e pedido de
exclusão (B10), administração com denúncias, ocultos, pedidos de exclusão e administradores (C1), ocultar e restaurar (C2),
e os estados de carregando, vazio, erro, sem conexão, sem permissão, conteúdo indisponível e página não encontrada (D1).
Versão para celular a partir de 360 px.

Não implementado, por decisão do usuário: IA de classificação, módulos e gerências, avisos, resumo semanal, artigos e aulas.

## Pendências e decisões de produto que ainda valem

- Domínio de e-mail da empresa (`EMAIL_DOMAIN`, P-03), limites de texto e de tags (`LIMITS`, P-06), validade do link e texto
  final do aviso de privacidade ficam como no design (sugestão, a validar).
- Texto do conteúdo é texto simples com quebras de linha (P-07); nada é interpretado como HTML.
- `screenshots/` guarda as capturas usadas na conferência visual (desktop e 360 px).
