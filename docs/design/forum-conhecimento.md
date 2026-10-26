# Design: Fórum interno de conhecimento (UI/UX e visual)

Status: rascunho para validação. Frentes cobertas: UX e visual. Não há frente de conversa, porque o PRD não prevê agente de IA.
Fontes: `docs/prd/forum-conhecimento.md`, `docs/planejamento/forum-conhecimento.md` (HU-01 a HU-18) e a referência visual do zip (protótipo "SynchroMind v2" e design system IDE.IA).

Convenções deste documento:
- **(sugestão)** marca uma proposta minha para uma pendência do planejamento ou uma lacuna. Precisa de validação.
- **a validar** marca valor visual ou texto que ainda não foi confirmado pelo usuário.
- Cada tela cita a origem (HU-xx, RF-xx, RNF-xx).

---

## 1. Contexto

**Quem usa (PRD, seção 4).** Funcionários de uma empresa de 50 a 500 pessoas. Quem resolveu um problema e quer registrá-lo, ou quem tem um problema e procura a solução. Times que divulgam o que desenvolvem. De 2 a 3 admins que moderam. A frequência de uso e o perfil por área (dev, operações, suporte) ainda são premissas.

**O que o design precisa provar.** O maior risco do produto é um fórum vazio em que ninguém busca nem escreve (H-03 e H-04, não validadas). Por isso o design põe a busca e o "publicar" a um clique em toda tela, e deixa a publicação curta (poucos campos).

**Restrições confirmadas.**
- Interface em português do Brasil (RNF-05, sugestão do PRD).
- Chrome, Edge, Firefox e Safari atuais. Responsivo, usável a partir de 360 px, sem app nativo. Teclado, contraste legível e texto alternativo (RNF-06).
- Só quem tem conta com e-mail confirmado vê conteúdo (RNF-01).
- Só nome e e-mail são guardados (RNF-04).
- Sem anexos, mensagens diretas nem posts anônimos (não objetivos).

**Fora do escopo do design.** Tudo que não tem história no planejamento. O que o protótipo traz além disso está na seção 8.

### Design system adotado

O protótipo "SynchroMind v2" carrega só os tokens do **IDE.IA Design System** (`colors.css`, `typography.css`, `spacing.css`, `fonts.css`, `styles.css` e `_ds_bundle.js` da pasta `ide-ia-design-system-…`). Todas as cores (`--green-600`, `--navy-900`, `--gray-200`…), a fonte Urbanist e os raios vêm dele. O **Synchro Design System** (azul `#153f6a`/`#0992f8`, tokens `--hl-*`) está no zip, mas o protótipo não o carrega: ele só aparece citado em `ds-base.js`, que a página não usa. O `logo.png` da raiz do zip (azul e dourado) também não aparece no cabeçalho do protótipo. O protótipo anterior (`App.tsx`, azul e em inglês) é versão antiga e foi usado só como contexto.

**Decisão: adotei o IDE.IA**, porque é o que o protótipo usa de fato. Se a empresa quiser a identidade azul e dourada da Synchro, só a seção 4 (tokens) muda. A estrutura de telas não muda.

---

## 2. UX

### 2.1 Mapa de telas

Sem sessão:
- A1 Cadastro (HU-01, HU-03)
- A2 Verifique seu e-mail (HU-01, HU-02)
- A3 Resultado do link de confirmação (HU-02)
- A4 Acesso bloqueado, conta não confirmada (HU-02)
- A5 Entrar (sugestão, ver pendência P-01)

Com sessão:
- B1 Início: lista, busca e filtro por tag (HU-06 crit. 3, HU-10, HU-12)
- B2 Publicar problema e solução (HU-06, HU-11)
- B3 Publicar pergunta (HU-07, HU-11)
- B4 Publicar em nome de um time (HU-18, HU-11)
- B5 Detalhe de pergunta, com respostas, votos e resposta aceita (HU-08, HU-13, HU-14)
- B6 Detalhe de problema e solução, e de post de time (HU-13)
- B7 Editar o próprio conteúdo (HU-09)
- B8 Denunciar (HU-16)
- B9 Minhas publicações (sugestão, ver 2.5)
- B10 Minha conta e pedido de exclusão (HU-04)

Admin:
- C1 Administração, com 4 abas: Denúncias (HU-16), Ocultos (HU-15), Pedidos de exclusão (HU-05) e Administradores (HU-17)
- C2 Ocultar e restaurar, dentro do detalhe (HU-15)

Transversais:
- D1 Estados: carregando, erro, sem conexão, sem permissão, conteúdo indisponível, sessão expirada.

### 2.2 Fluxos ponta a ponta

**Fluxo 1. Entrar (RF-01, RF-14).**
1. A pessoa abre o fórum sem sessão e vê A5. Clica em "Criar conta" e vai para A1.
2. Preenche nome e e-mail da empresa, lê o aviso de privacidade e marca "Li e entendi". O botão "Criar conta" só conclui com o aviso reconhecido (HU-03).
3. Vê A2: "Enviamos um link para ...". Abre o e-mail e clica no link.
4. A3 confirma: "E-mail confirmado" e entra no fórum (B1). Se o link expirou ou já foi usado, A3 explica e oferece "Enviar novo link".
5. Se tentar entrar antes de confirmar, vê A4 com "Reenviar link".

Pontos em que a pessoa pode travar: o e-mail não chega (A2 oferece reenvio, orienta a olhar o spam e mostra o e-mail digitado com opção de corrigir); digitou o e-mail de outro domínio (erro dito no campo, com o domínio aceito).

**Fluxo 2. Buscar e votar (RF-06, RF-08).** B1, a pessoa digita um termo (ou clica numa tag), vê os resultados, abre um post (B5 ou B6), lê, e vota em "Foi útil". Se não achou, usa "Fazer uma pergunta com este termo", que leva o termo já preenchido no título da B3.

**Fluxo 3. Compartilhar uma solução (RF-02).** Botão "Compartilhar uma solução" no cabeçalho, B2, preenche título, problema, solução e tags, publica e cai no detalhe (B6) com aviso "Publicado".

**Fluxo 4. Perguntar e aceitar (RF-04, RF-05, RF-09).** "Fazer uma pergunta", B3, publica, vê B5 sem respostas. Outras pessoas respondem. O autor da pergunta marca "Aceitar resposta" e a resposta sobe ao topo, destacada.

**Fluxo 5. Divulgar o trabalho do time (RF-03).** Menu "Compartilhar", "Em nome de um time", B4, escolhe o time na lista, escreve e publica. O post aparece com o time e o nome do autor.

**Fluxo 6. Denunciar e moderar (RF-11, RF-12).** Qualquer pessoa: menu "Mais ações" do conteúdo, "Denunciar", B8, envia. O admin vê o item em C1, aba Denúncias, abre, decide ocultar. O item some para os demais, vai para a aba Ocultos e pode ser restaurado.

**Fluxo 7. Pedir exclusão da conta (RF-15).** Menu do avatar, "Minha conta", B10, "Pedir exclusão da conta", lê o que acontece, confirma, vê "Pedido pendente". Admin: C1, aba Pedidos de exclusão, "Excluir conta", confirma. A conta deixa de existir, e o conteúdo fica com "Conta excluída" no lugar do autor.

### 2.3 Estrutura global

**Cabeçalho (desktop, 72 px, fixo no topo).** Segue o protótipo, sem as entradas que dependiam de recursos fora do escopo.
- Esquerda: marca (quadrado verde com "S" e o nome do produto, provisório, ver P-02).
- Menu: "Início". "Administração" aparece só para admin (RF-11, RF-13).
- Direita: botão primário em pílula "Fazer uma pergunta" (como no protótipo), botão secundário em pílula "Compartilhar" com um menu de duas opções ("Uma solução que resolvi" e, a partir da 3ª entrega, "Em nome de um time"), e o avatar com iniciais e o nome. O avatar abre o menu: Minha conta, Minhas publicações, Sair.
- O protótipo mostra a gerência da pessoa abaixo do nome. Aqui isso não existe (não há gerências no PRD), então só o nome aparece.

**Cabeçalho (celular, 56 px).** Marca (só o quadrado "S" abaixo de 400 px), botão "Buscar" (ícone com rótulo acessível) e botão de menu. O menu abre uma folha com Início, Administração (admin), Minha conta, Minhas publicações, Sair. O botão flutuante **"Publicar"** (pílula verde, 48 px de altura, canto inferior direito, acima da barra do navegador) abre uma folha inferior com: Fazer uma pergunta, Uma solução que resolvi, Em nome de um time.

**Rodapé.** Nenhum no MVP.

**Pontos de navegação por teclado.** Primeiro item da página: link "Pular para o conteúdo". Ordem: marca, menu, ações do cabeçalho, avatar, conteúdo. Foco sempre visível (ver 4.5).

**Layout.** Conteúdo centralizado, largura máxima de 1180 px, com margens de 40 px no desktop, 24 px no tablet e 16 px no celular. Pontos de quebra (a validar): celular até 639 px, tablet de 640 a 1023 px, desktop a partir de 1024 px. O protótipo foi feito só para desktop (largura mínima de 1180 px). Todo o comportamento de tablet e celular deste documento é proposta minha.

### 2.4 Telas

#### A1 Cadastro (origem: HU-01, HU-03, RF-01, RF-14)

Objetivo: criar a conta com o e-mail da empresa.

Conteúdo (cartão de 480 px, centralizado, sem o menu do cabeçalho; só a marca):
- Título "Criar conta".
- Texto de apoio: "Use o seu e-mail da empresa. Enviaremos um link para confirmar."
- Campo "Nome" (obrigatório). Ajuda: "Como você quer aparecer nas suas publicações."
- Campo "E-mail da empresa" (obrigatório), tipo e-mail, exemplo "nome@empresa.com.br" (o domínio real vem da TI, ver P-03).
- Bloco "Seus dados" (aviso de privacidade, HU-03): caixa com fundo `verde-100`, rótulo em maiúsculas "SEUS DADOS", texto curto e a caixa de marcação "Li e entendi como meus dados são usados" (obrigatória).
- Botão primário "Criar conta" e link "Já tenho conta. Entrar".

Texto do aviso (sugestão, o texto final é "A definir" na HU-03 e depende de quem responde pelos dados, pergunta aberta do PRD): "Guardamos só o seu nome e o seu e-mail. O seu nome aparece nas coisas que você publica. O seu e-mail é visto apenas pelos administradores do fórum. Você pode pedir a exclusão da conta quando quiser; o que você publicou continua no fórum, sem o seu nome."
Pontos a confirmar com a TI antes de publicar esse texto: quem são "os administradores", e se o e-mail fica mesmo restrito a eles (a tela C1 mostra e-mails aos admins, ver 2.4 C1).

Validação (perto do campo, ao sair do campo e ao enviar):
- Campos vazios (HU-01 crit. 4): "Informe o seu nome." / "Informe o seu e-mail." Ao enviar, o foco vai para o primeiro campo com erro e um resumo no topo lista os campos que faltam.
- Formato inválido: "Esse e-mail parece incompleto. Exemplo: nome@empresa.com.br."
- Domínio de fora (HU-01 crit. 2): "Só e-mails da empresa são aceitos. Use um e-mail que termine com @empresa.com.br." (domínio real na mensagem).
- E-mail já cadastrado (HU-01 crit. 3): "Já existe uma conta com esse e-mail." com links "Entrar" e, se a conta não foi confirmada, "Reenviar link de confirmação".
- Aviso não marcado: o botão continua ativo (botão desabilitado não explica nada) e, ao clicar, aparece "Para criar a conta, marque que leu o aviso." junto à caixa (HU-03 crit. 2).

Estados:
- Carregando: botão mostra indicador e texto "Criando conta..." e fica inativo.
- Sucesso: vai para A2.
- Erro do servidor: alerta no topo do cartão: "Não foi possível criar a conta agora. Tente de novo em instantes." com botão "Tentar de novo". Os dados digitados são mantidos.
- Vazio: não se aplica.

#### A2 Verifique seu e-mail (origem: HU-01, HU-02)

Conteúdo: título "Confirme o seu e-mail", texto "Enviamos um link para **nome@empresa.com.br**. Clique nele para liberar o acesso.", ajuda "Não chegou? Veja a caixa de spam. O link vale por [prazo]." (prazo "A definir", HU-02 crit. 4; não escrever número enquanto não houver decisão), botão secundário "Enviar novo link" (com espera de 60 segundos entre envios, sugestão, a validar com a TI) e link "Corrigir o e-mail".
Estados: reenvio com sucesso, mensagem "Link enviado de novo." (região `aria-live`); erro, "Não foi possível enviar. Tente de novo."; espera, o botão mostra "Enviar novo link (em 45 s)".

#### A3 Resultado do link de confirmação (origem: HU-02 crit. 1 e 3)

- Sucesso: "E-mail confirmado. Sua conta está pronta." Botão primário "Ir para o fórum". Se a pessoa já está com a sessão aberta no mesmo navegador, entra direto em B1 com aviso "E-mail confirmado".
- Link expirado ou já usado: "Este link não vale mais. Ele pode ter expirado ou já ter sido usado." Botão "Enviar novo link" (pede o e-mail se não houver sessão) e link "Entrar".
- Carregando: "Confirmando o seu e-mail..." (indicador).
- Erro de rede: "Não conseguimos confirmar agora. Tente abrir o link de novo."

#### A4 Acesso bloqueado, conta não confirmada (origem: HU-02 crit. 2, RNF-01)

Aparece quando a pessoa tenta entrar sem ter confirmado. Texto: "Falta confirmar o seu e-mail. Abra o link que enviamos para **e-mail**." Botões "Enviar novo link" e "Usar outro e-mail". Nenhum conteúdo do fórum é carregado.

#### A5 Entrar (sugestão; origem: necessidade implícita em HU-02 e RNF-01)

As histórias descrevem cadastro e confirmação, mas não dizem como quem já tem conta volta a entrar. Como a conta guarda só nome e e-mail (HU-01, RNF-04) e não há senha, desenhei **entrada por link enviado ao e-mail** (a validar, é decisão do `solutions-architect`, ver P-01).
Conteúdo: título "Entrar", campo "E-mail da empresa", botão "Enviar link de acesso", link "Criar conta". Depois do envio, mostra o mesmo layout de A2 com "Enviamos um link de acesso para ...".
Mensagem para e-mail sem conta (ou de conta excluída, HU-05): resposta neutra, igual para os dois casos e igual à de sucesso: "Se existir uma conta com esse e-mail, enviamos um link de acesso." (evita revelar quem tem conta; sugestão). Conta excluída não consegue entrar (HU-05 crit. 1) e recebe a mesma resposta neutra.
Sessão expirada no meio do uso: volta para A5 com a mensagem "Sua sessão acabou. Entre de novo para continuar." e, depois de entrar, retorna à página em que estava.

#### B1 Início: lista, busca e filtro por tag (origem: HU-10, HU-12, HU-06 crit. 3; RF-06, RF-07, RNF-02)

Objetivo: achar algo que já foi resolvido, ou entrar numa publicação. Uma tarefa principal: buscar.

Layout desktop (como o protótipo "Início" e "Discussões", fundidos):
1. Título "O que você precisa resolver?" (H1, 44 px) e texto "Busque no que a empresa já resolveu. Se não achar, pergunte." (a validar).
2. Campo de busca em pílula, 56 px, com botão escuro "Buscar" (como no protótipo). Placeholder "Ex.: erro ao subir o container" (exemplo a validar).
3. Duas colunas: à esquerda a lista (flexível), à direita uma coluna de 300 px com:
   - Cartão "Filtros": grupo "Tipo" (Todos, Perguntas, Problema e solução, Posts de time) e grupo "Tags" (as mais usadas, em pílulas, mais campo "Buscar tag"). O protótipo tem "Filtros da IA"; aqui as tags são as escolhidas pelas pessoas (HU-11), sem IA.
   - Cartão escuro (`tinta`) "Resolveu um problema?" com texto "Registre a solução para o próximo time não refazer o trabalho." e botão verde "Compartilhar uma solução". Reforça o objetivo do PRD de reduzir retrabalho. Só aparece em B1.
4. Acima da lista: contagem ("42 publicações" ou "8 resultados para 'container'") e ordenação.

Ordenação (sugestão, o PRD só define a ordem da busca):
- Com busca: relevância, e em empate mais votos (RNF-02, HU-10 crit. 3). Não há opção de mudar.
- Sem busca: "Recentes" (padrão) e "Mais votados".

**Cartão de item da lista** (linha de 20 px de raio no contêiner, divisórias de 1 px entre itens, como o protótipo):
- Linha de metadados: selo de tipo (texto, ex. "PERGUNTA", "PROBLEMA E SOLUÇÃO", "POST DE TIME") + selo de estado (só para perguntas, ver 4.6) + "Nome · há 2 dias". Para post de time: "Time Pagamentos · por Nome".
- Título, 18 px, 700, link para o detalhe.
- Trecho de 2 linhas do texto (sugestão, ajuda a decidir sem abrir).
- Tags em verde-texto.
- Coluna direita (150 px): número de votos (22 px, 800) com rótulo "votos" e, para perguntas, número de respostas com rótulo "respostas". No protótipo essa coluna mostra "respostas / acompanhando"; aqui não existe "acompanhar".
- No celular a coluna direita vira uma linha de texto no pé do cartão: "12 votos · 3 respostas".
- Autor de conta excluída: ver 2.6.

**Filtro por tag (HU-12).** Clicar numa tag, em qualquer lugar (lista, detalhe, filtro lateral), leva a B1 com a tag aplicada. O filtro aplicado aparece como pílula removível acima da lista ("#java ×", com rótulo acessível "Remover filtro #java"). A URL guarda busca, tipo, tag e ordenação, para o link poder ser compartilhado e o botão Voltar funcionar.

**Celular.** Busca em largura total. Os filtros ficam atrás do botão "Filtrar" (mostra a quantidade de filtros ativos, ex. "Filtrar (2)") que abre uma folha inferior com Tipo, Tags, e os botões "Limpar" e "Ver N resultados". Cartão escuro "Resolveu um problema?" aparece uma vez, abaixo do terceiro item (sugestão).

**Paginação (sugestão, a validar).** 20 itens por vez, botão "Carregar mais" no fim da lista (mais simples e acessível que rolagem infinita). O PRD não define volume.

Estados:
- **Carregando:** 5 esqueletos de item (blocos cinza `cinza-200`, sem animação para quem prefere menos movimento). Ao buscar, a lista antiga fica visível, com 60% de opacidade, até a nova chegar, e um texto "Buscando..." para leitores de tela (`aria-live="polite"`). Meta de RNF-02: resultado em até 2 s; se passar de 2 s, o texto vira "Ainda buscando...".
- **Lista vazia, nenhuma publicação no fórum (HU-06 crit. 3):** ilustração simples (ícone de linha), título "Ainda não há publicações", texto "Seja a primeira pessoa a compartilhar o que você resolveu." e botões "Compartilhar uma solução" e "Fazer uma pergunta". Antes do lançamento a TI faz a carga inicial (10 a 15 itens), então esse estado só deve aparecer em teste.
- **Sem resultados da busca (HU-10 crit. 4):** "Nenhum resultado para 'termo'." Dicas: "Confira a escrita ou use palavras mais gerais." Botão primário "Fazer uma pergunta com este termo" (leva o termo para o título da B3) e botão secundário "Limpar busca".
- **Tag sem publicações visíveis (HU-12 crit. 2):** "Nenhuma publicação com a tag #nome." e botão "Ver todas as publicações". (Inclui o caso de todos os posts da tag estarem ocultos.)
- **Erro:** "Não foi possível carregar as publicações." com botão "Tentar de novo". Os filtros aplicados continuam visíveis.
- **Sem conexão:** faixa fixa no topo "Você está sem conexão. Vamos tentar de novo quando ela voltar."
- **Sucesso:** lista como descrito. Termos buscados aparecem em negrito nos títulos e trechos (sugestão; a busca ignora acentos e maiúsculas, então o realce também deve ignorar).
- **Sem permissão:** não se aplica a B1 (quem não tem sessão vai para A5).

#### B2 Publicar problema e solução (origem: HU-06, HU-11; RF-02, RF-07)

Objetivo: registrar um problema resolvido, com o mínimo de esforço. Formulário em coluna única, largura máxima de 820 px (como "Fazer uma pergunta" do protótipo).

Campos, na ordem:
1. **Título** (obrigatório). Rótulo "Título". Ajuda: "Descreva o problema como outra pessoa o buscaria. Ex.: Erro 'connection refused' ao subir o banco local." *Sugestão:* o planejamento só pede problema e solução (HU-06), mas a lista e a busca por título (RNF-02) precisam de um título. Ver P-05.
2. **Problema** (obrigatório), área de texto com 5 linhas. Ajuda: "O que acontecia? Em qual ambiente? Qual era a mensagem de erro?"
3. **Solução** (obrigatório), área de texto com 6 linhas. Ajuda: "O que você fez para resolver? Se der, diga por que funcionou."
4. **Tags** (opcional). Ver componente "Campo de tags" (4.7). Ajuda: "Até 5 tags. Ajudam outras pessoas a achar este post." (limite e formato "A definir", HU-11 crit. 3; 5 tags, minúsculas, letras, números e hífen são sugestão.)
5. Aviso de conteúdo (texto fixo, ícone de informação): "Este post fica visível para toda a empresa. Não inclua senhas, chaves de acesso, dados de clientes nem informações confidenciais." (mitiga o risco de conteúdo confidencial do PRD; a validar.)

Ações: botão primário "Publicar solução" e botão secundário "Cancelar". No celular a barra de ações fica fixa no rodapé da tela. Se houver texto digitado, "Cancelar" e o botão Voltar do navegador pedem confirmação: "Descartar o que você escreveu?" com "Continuar editando" e "Descartar".

Validação (HU-06 crit. 2): ao publicar com campos vazios, nada é publicado, o foco vai ao primeiro campo com erro e o resumo no topo diz quais faltam. Mensagens: "Informe o título.", "Descreva o problema.", "Descreva a solução."
Limite de tamanho (A definir, HU-06 crit. 4): se houver limite, mostra contador "1.200 / 5.000" abaixo do campo, que só aparece a partir de 80% do limite; ao exceder, "O texto passou do limite em 120 caracteres." O valor vem do arquiteto ou do PO (P-06).
Formatação (a definir, P-07): o design assume texto simples com quebras de linha. Como o conteúdo de quem resolve problemas costuma ter trechos de código, a sugestão é aceitar um formato mínimo (código em linha e em bloco, listas e links), com botões acima do campo. Sem decisão, usar texto simples.

Estados: carregando ("Publicando..." no botão, campos travados); sucesso (vai para o detalhe B6, com alerta "Publicado. Todos na empresa já podem ver."); erro de envio (alerta "Não foi possível publicar. O texto continua aqui. Tente de novo." e o conteúdo é mantido); sem conexão (botão mantém o texto, alerta de conexão).
Sugestão de tags com carregando e vazio: ver 4.7.

#### B3 Publicar pergunta (origem: HU-07, HU-11; RF-04)

Mesma estrutura e linguagem de B2, com:
- **Título** (obrigatório): "Qual é a sua dúvida?" (rótulo do protótipo), placeholder "Como faço para...".
- **Descrição** (obrigatória): "Mais contexto". Ajuda: "O que você já tentou, em qual ambiente, qual erro apareceu." No protótipo esse campo é opcional; no planejamento é obrigatório (HU-07 crit. 2), então segui o planejamento.
- **Tags** (opcional).
- Aviso de conteúdo (igual ao de B2).
- Botão primário "Publicar pergunta".

Bloco "Talvez já esteja respondido" (sugestão, vem do protótipo, mas sem IA): enquanto a pessoa digita o título (mínimo de 4 caracteres, depois de 500 ms parada), mostra até 3 publicações encontradas pela mesma busca de B1, cada uma com título, tipo, votos e um link que abre em nova aba. Serve ao risco "ninguém busca antes de perguntar" (H-04). Não tem história própria. **É opcional: se o time achar que não cabe no MVP, remova sem afetar o resto.** Carregando: "Procurando publicações parecidas..." Vazio: o bloco some. Erro: o bloco some, sem mensagem (não impede publicar).

Validação: "Informe o título." e "Descreva a dúvida." Estados como em B2. Sucesso leva a B5 com alerta "Pergunta publicada."

#### B4 Publicar em nome de um time (origem: HU-18, HU-11; RF-03; 3ª entrega)

Objetivo: divulgar o que um time desenvolve.
Campos: 
1. **Time** (obrigatório), lista de seleção (caixa de seleção com busca), placeholder "Escolha o time". Ajuda: "O post aparece com o nome do time e com o seu nome."
2. **Título** (obrigatório). Ex. "Novo painel de acompanhamento de pedidos".
3. **Texto** (obrigatório), rótulo "O que o time está desenvolvendo?".
4. **Tags** (opcional).
5. Aviso de conteúdo igual ao de B2.
Botão: "Publicar pelo time".

Validação (HU-18 crit. 2): sem time escolhido, "Escolha o time em nome do qual você está publicando."
Estados:
- Lista de times vazia (a lista de times é pendência, P-04): o campo mostra "Nenhum time cadastrado ainda." e o botão fica inativo, com o texto "Peça à equipe de TI para cadastrar os times." (sugestão de texto).
- Carregando a lista: campo com indicador, "Carregando times...".
- Erro ao carregar a lista: "Não foi possível carregar os times." com "Tentar de novo".
- Demais estados como B2.

Dependência aberta: como a pessoa se liga a um time (HU-18 crit. 3). **Sugestão:** no MVP qualquer usuário pode escolher qualquer time da lista, porque o PRD diz "escolhendo o time numa lista" e não fala de vínculo. Se a empresa quiser restringir, a lista passa a mostrar só os times da pessoa e o estado vazio muda para "Você ainda não faz parte de nenhum time."

#### B5 Detalhe de pergunta (origem: HU-08, HU-13, HU-14, HU-09, HU-16, HU-15)

Layout desktop: coluna principal (flexível, máximo 760 px) e coluna lateral de 300 px. No celular, tudo em uma coluna e a lateral desce para o fim.

Coluna principal, de cima para baixo:
1. Linha de selos: tipo ("PERGUNTA") e estado ("Respondida", "Com respostas" ou "Sem respostas", ver 4.6). Abaixo, "Nome · há 6 dias" e, se foi editada, "editado há 2 dias" (ver B7).
2. Título (H1, 34 px).
3. Tags (clicáveis, levam ao filtro de B1).
4. **Cartão da pergunta:** avatar com iniciais, nome, texto da pergunta, e rodapé com: botão "Foi útil" com a contagem (voto, ver abaixo), e o menu "Mais ações" (Editar se for do autor; Denunciar se for de outra pessoa; Ocultar se for admin).
5. Título de seção "N respostas" (por exemplo "3 respostas"), com a ordenação: primeiro a resposta aceita (HU-14 crit. 1, RF-09), depois as demais, da mais votada para a menos votada, e em empate da mais antiga para a mais nova (sugestão, a validar).
6. **Cartão de resposta:** igual ao da pergunta, com nome, "há 5 dias", texto, voto e menu. A **resposta aceita** tem borda de 2 px verde, o selo "Resposta aceita" com ícone de check no canto superior direito (como no protótipo, mas o selo usa texto escuro sobre verde, ver 4.4) e fica no topo. Ao autor da pergunta, as demais respostas mostram o botão "Aceitar resposta".
7. **Formulário "Sua resposta"** (HU-08): rótulo, área de texto com 4 linhas, botão primário "Publicar resposta". Vazio (HU-08 crit. 2): nada é publicado e aparece "Escreva a sua resposta antes de enviar." O protótipo tem também "Responder como anônimo" e "complementos"; não entram (posts anônimos são não objetivo e o PRD não tem comentários).

Coluna lateral (cartão "Sobre esta pergunta"): lista rótulo e valor: Publicada em, Atualizada em (se foi editada), Respostas, Votos. Abaixo, "Mais com as mesmas tags" com até 3 links (sugestão, a validar; opcional). O protótipo tem aqui "Próximo passo" e "Quem contribui nesse assunto", que ficam fora.

**Voto (HU-13, RF-08).**
- Botão em pílula "Foi útil" com ícone de seta para cima e a contagem. Estado ativado (já votei): fundo `verde-200`, borda `verde-texto`, ícone de check e texto "Útil · 19", com `aria-pressed="true"`. Estado normal: contorno, "Foi útil · 18".
- Clicar de novo retira o voto (crit. 3). Não é possível votar duas vezes (crit. 2), porque o botão é uma alternância.
- Atualização imediata na tela; se o servidor falhar, volta ao valor anterior e mostra "Não foi possível registrar o voto. Tente de novo."
- **Voto no próprio conteúdo (pendência de HU-13 crit. 4) (sugestão):** não permitir. O autor vê só a contagem ("18 pessoas acharam útil"), sem botão, e um texto de ajuda para leitores de tela. Botão desabilitado sem explicação confunde, especialmente no celular, então o botão simplesmente não existe. Fica a decisão do usuário (P-08).
- Votos, quando a pergunta e as respostas têm contagens separadas: cada cartão tem a sua.

**Aceitar resposta (HU-14, RF-09).**
- Visível só ao autor da pergunta (crit. 2). Botão secundário com ícone de check "Aceitar resposta", no rodapé da resposta.
- Ao aceitar: a resposta sobe ao topo com animação curta (sem animação se o usuário reduz movimento), o foco vai para ela, aparece o alerta "Resposta aceita." e o selo da pergunta passa a "Respondida".
- **Aceitar outra quando já existe uma (pendência de HU-14 crit. 3) (sugestão):** só uma resposta aceita por pergunta. Ao clicar em "Aceitar resposta" em outra, abre confirmação: "Trocar a resposta aceita? A resposta atual deixa de ser a aceita." com "Trocar" e "Cancelar". A aceita mostra a opção "Desfazer aceite" no menu "Mais ações" (só ao autor da pergunta). Razão: a métrica do PRD é a proporção de perguntas com resposta aceita; com uma só, o destaque no topo é inequívoco. Decisão do usuário (P-09).

Estados do detalhe:
- **Carregando:** esqueleto do título, do cartão da pergunta e de dois cartões de resposta.
- **Pergunta sem respostas:** no lugar da lista, "Ainda ninguém respondeu." e "Você sabe como resolver? Escreva a primeira resposta abaixo." O selo é "Sem respostas".
- **Erro de carregar:** "Não foi possível abrir esta publicação." e botão "Tentar de novo".
- **Erro ao enviar resposta:** alerta acima do botão, com o texto mantido.
- **Conteúdo indisponível (link de item oculto ou inexistente, para quem não é autor nem admin):** página "Esta publicação não está disponível." com o texto "Ela pode ter sido ocultada ou removida." e botão "Voltar ao início". Mesmo texto para os dois casos, para não revelar o que foi ocultado.
- **Conteúdo oculto para o autor e para admins:** ver 2.5.
- **Pergunta com a resposta aceita oculta:** ver 2.5.

#### B6 Detalhe de problema e solução e de post de time (origem: HU-06, HU-13, HU-18)

Mesma casca de B5, sem a seção de respostas e sem o formulário de resposta (HU-08 só trata de perguntas). Conteúdo:
- Selos e metadados. Para post de time: "TIME PAGAMENTOS" em selo e "por Nome · há 2 dias" (HU-18 crit. 1).
- Título e tags.
- **Problema e solução:** duas seções com rótulos em maiúsculas "PROBLEMA" e "SOLUÇÃO" (padrão de rótulo do design system), cada uma num cartão. A solução tem borda de 2 px verde, para ser o foco da leitura (mesmo tratamento da resposta aceita, mas sem o selo "Resposta aceita").
- **Post de time:** um único cartão com o texto.
- Rodapé: voto "Foi útil" (HU-13), menu "Mais ações".
- Lateral: "Sobre este post" (Publicado em, Atualizado em, Votos; para post de time, também o Time).

Estados: carregando, erro e conteúdo indisponível como em B5.

#### B7 Editar o próprio conteúdo (origem: HU-09, RF-10)

- "Editar" aparece só no menu "Mais ações" do autor (HU-09 crit. 2). Admin não vê "Editar" no conteúdo de outras pessoas (HU-15 crit. 4).
- A edição é no próprio cartão (sem trocar de página): o texto vira campos preenchidos, com os mesmos rótulos e ajuda do formulário de publicação (título, problema, solução, tags, conforme o tipo) e os botões "Salvar alterações" e "Cancelar".
- Texto vazio (HU-09 crit. 3): a alteração é recusada, com "Este campo não pode ficar vazio." junto ao campo.
- Ao salvar: o cartão volta ao modo de leitura, aparece o alerta "Alterações salvas." e o conteúdo mostra "editado há instantes" (sugestão: mostrar que houve edição, para quem votou ou aceitou uma resposta saber que o texto mudou).
- Cancelar com alterações pede confirmação, como em B2.
- Estados: carregando ("Salvando..."), erro ("Não foi possível salvar. Suas alterações continuam aqui."), conflito (a pessoa abriu em duas abas) fica a cargo do arquiteto, sem tela própria.

#### B8 Denunciar (origem: HU-16, RF-12)

- "Denunciar" fica no menu "Mais ações" de qualquer post, pergunta ou resposta de outra pessoa. Não aparece em conteúdo próprio (sugestão).
- Abre uma janela (no celular, folha inferior) "Denunciar este conteúdo" com:
  - Pergunta "Qual é o problema?" e opções em botões de rádio (obrigatória): "Informação errada ou desatualizada", "Conteúdo ofensivo", "Conteúdo confidencial" e "Outro motivo". As três primeiras vêm do PRD (errado, ofensivo ou confidencial); "Outro motivo" é sugestão.
  - Campo "Quer explicar? (opcional)", até 300 caracteres (sugestão).
  - Botões "Enviar denúncia" e "Cancelar".
  - Texto: "Os administradores vão analisar. A pessoa que escreveu não é avisada." (a validar, é uma regra de produto que o PRD não define).
- Sucesso: a janela fecha, o foco volta ao menu e aparece "Denúncia enviada. Obrigado por avisar." O item do menu passa a "Denúncia enviada" (inativo).
- Já denunciou (HU-16 crit. 2): o item do menu aparece como "Você já denunciou" e, se a pessoa chegar a enviar de novo (outra aba), a resposta é "Você já denunciou este conteúdo."
- Erro: "Não foi possível enviar a denúncia. Tente de novo."
- Sem motivo escolhido: "Escolha um motivo."

#### B9 Minhas publicações (sugestão; origem: HU-09 e pendência de HU-15 crit. 5)

Nenhuma história pede esta tela, mas ela resolve duas coisas: o autor precisa **achar** o que escreveu para editar (HU-09), e o autor de conteúdo oculto precisa de um lugar onde veja o que aconteceu com ele (ver 2.5). Se não for aceita, o autor de conteúdo oculto perde o acesso a ele, e o autor perde o atalho para editar.
- Lista simples, do mesmo formato de B1, com tudo que a pessoa publicou (posts, perguntas e respostas; respostas aparecem com o título da pergunta). Sem busca nem filtros no MVP.
- Itens ocultos mostram o selo "OCULTO" (texto e ícone, não só cor) e a linha "Só você e os administradores veem este conteúdo."
- Estados: carregando (esqueletos), vazio ("Você ainda não publicou nada." com botões de publicar), erro com "Tentar de novo".

#### B10 Minha conta e pedido de exclusão (origem: HU-04, RF-15)

Conteúdo: título "Minha conta". Dados somente para leitura: nome e e-mail. Seção "Excluir minha conta" (cartão com borda `erro`, ícone de aviso e rótulo em maiúsculas):
- Texto: "Você pode pedir a exclusão da sua conta. Os administradores analisam o pedido."
- Botão de contorno "Pedir exclusão da conta".

Janela de confirmação (HU-04 crit. 1), no celular em folha inferior:
- Título "Pedir a exclusão da sua conta?"
- Lista do que acontece (linguagem simples):
  - "Os administradores vão analisar o seu pedido."
  - "Depois da exclusão, o seu nome e o seu e-mail serão apagados e você não vai mais conseguir entrar."
  - "O que você publicou continua no fórum, **sem o seu nome**. Se algum texto seu tiver dados pessoais, edite-o antes ou peça a um administrador para ocultá-lo." (mitiga o risco do PRD, seção 11.)
- Caixa de marcação obrigatória: "Entendi que o que publiquei continua no fórum, sem o meu nome."
- Botões "Enviar pedido" (botão de perigo, ver 4.7) e "Cancelar". "Cancelar" tem o foco inicial (ação segura).

Estados:
- Depois de enviar (HU-04 crit. 2): a seção mostra o selo "PEDIDO PENDENTE" (texto e ícone de relógio), "Enviado em 12/11/2026. Os administradores ainda vão analisar." O botão desaparece.
- Pedir de novo com um pedido pendente (HU-04 crit. 3): como o botão não existe mais, o caso aparece só se a pessoa tiver o pedido em outra aba. Mensagem: "Você já tem um pedido de exclusão pendente."
- Carregando, erro ("Não foi possível enviar o pedido. Tente de novo.").
- O usuário continua com acesso normal enquanto o pedido está pendente (sugestão). Cancelar o pedido não tem história; ver P-10.

#### C1 Administração (origem: HU-15, HU-16, HU-17, HU-05; RF-11, RF-12, RF-13, RF-15)

Acesso: item "Administração" no menu, só para admins. Quem não é admin e abre o endereço vê **"Sem permissão"** (ver D1). O título é "Administração" com quatro abas (navegação por teclado com setas, `role="tablist"`). Cada aba mostra um número de pendências no rótulo ("Denúncias (3)"), com texto e não só cor.

**Aba Denúncias (HU-16).**
- Filtro: "Abertas" (padrão) e "Resolvidas".
- Cada denúncia: trecho ou título do item, tipo (Post, Pergunta, Resposta), motivo, quantas pessoas denunciaram, nome de quem denunciou e quando (admins veem o nome; sugestão), "Ver conteúdo" (abre o detalhe) e "Ocultar".
- **O que acontece com a denúncia depois que o item é ocultado (pendência de HU-16 crit. 4) (sugestão):** a denúncia sai de "Abertas" e vai para "Resolvidas" com a anotação "Ocultado por Nome em 20/11". Se o item for restaurado, volta a "Abertas"? Não: continua em "Resolvidas" e o admin vê o aviso "Restaurado por Nome em ...".
- **"Dispensar denúncia"** (sugestão, não está nas histórias): para o admin que analisou e decidiu não ocultar, a denúncia vai para "Resolvidas" com "Dispensada por Nome". Sem essa ação, a lista de abertas nunca esvazia. Decisão do usuário (P-11).
- Vazio: "Nenhuma denúncia aberta." Carregando: esqueletos. Erro: "Não foi possível carregar as denúncias." com "Tentar de novo".
- Celular: cada denúncia vira um cartão, com as ações abaixo.

**Aba Ocultos (HU-15).**
- Lista dos itens ocultos: título ou trecho, tipo, autor, "Ocultado por Nome em 20/11" e botão "Restaurar" (sem confirmação, é reversível; aparece "Restaurado" com opção "Desfazer" por 8 segundos) e "Ver conteúdo".
- Vazio: "Nenhum conteúdo oculto." Demais estados como acima.

**Aba Pedidos de exclusão (HU-05, RF-15).**
- Filtro "Pendentes" (padrão) e "Concluídos".
- Pendentes: nome, e-mail, data do pedido, botão "Excluir conta".
- Confirmação ao excluir: título "Excluir a conta de Nome?", texto "O nome e o e-mail serão apagados e a pessoa não poderá mais entrar. Os posts, perguntas e respostas continuam no fórum, sem o nome dela. Esta ação não pode ser desfeita." Botões "Excluir conta" (perigo) e "Cancelar" (foco inicial).
- Concluídos: como nome e e-mail foram apagados, a linha mostra "Conta excluída" e a data da exclusão e do pedido, sem dados pessoais.
- Vazio: "Nenhum pedido pendente." Se o pedido for de uma pessoa que também é admin, o aviso adicional "Esta pessoa é administradora." (e a ação continua possível). Se for o último admin, a regra é do arquiteto (P-12).
- Sem permissão: um usuário comum não vê a aba nem a rota (HU-05 crit. 3).

**Aba Administradores (HU-17).**
- Lista dos admins atuais: nome, e-mail, "Admin desde" (HU-17 crit. 3).
- Botão "Promover alguém a admin" abre uma janela com um campo de busca por nome ou e-mail (lista de sugestão em caixa de combinação, só contas confirmadas) e a confirmação: "Nome passará a poder ocultar e restaurar conteúdo, ver denúncias, tratar pedidos de exclusão e promover outras pessoas." Botões "Promover" e "Cancelar".
- Sucesso: "Nome agora é administrador." e aparece na lista.
- Erros: busca sem resultado ("Ninguém com esse nome ou e-mail."); a pessoa já é admin ("Essa pessoa já é administradora.").
- Rebaixar admin não tem história (P-13); a lista não mostra essa ação.
- Como o primeiro admin é definido é tarefa técnica da TI (pendência do planejamento); não há tela.

#### C2 Ocultar e restaurar no detalhe (origem: HU-15)

- Admin vê, no menu "Mais ações" de qualquer post, pergunta ou resposta de outra pessoa, o item "Ocultar". Usuário comum não vê (HU-15 crit. 3). Admin **não** vê "Editar" no conteúdo alheio (crit. 4).
- Confirmação: "Ocultar este conteúdo? Ele deixa de aparecer para as outras pessoas. Você pode restaurá-lo depois." Botões "Ocultar" e "Cancelar". Sem campo de motivo no MVP (sugestão, simplifica; ver P-14).
- Depois de ocultar: o admin continua vendo o conteúdo, com a faixa **"Oculto"** no topo do item e o botão "Restaurar". Ao restaurar, a faixa some e aparece "Conteúdo restaurado."
- Estados: carregando (botão "Ocultando..."), erro ("Não foi possível ocultar. Tente de novo.").

### 2.5 O que cada pessoa vê de conteúdo oculto

Resolve a pendência de HU-15 crit. 5 como **sugestão**:

| Quem | O que vê |
| -- | -- |
| Outros usuários | Nada. O item não aparece na lista, na busca, nas contagens (respostas, votos, "Sem respostas") nem nos filtros. Pelo link direto, a página "Esta publicação não está disponível." |
| Autor do conteúdo oculto | Continua vendo o próprio conteúdo, só em "Minhas publicações" e pelo link, com a faixa: "Este conteúdo foi ocultado pelos administradores e não aparece para outras pessoas. Se acha que foi engano, fale com um administrador." O autor não pode editar nem apagar enquanto estiver oculto (sugestão: evita burlar a moderação). A faixa não diz o motivo (não existe motivo no MVP). |
| Admin | O conteúdo inteiro, com a faixa "Oculto por Nome em 20/11" e o botão "Restaurar". Acha o item nas abas Denúncias e Ocultos de C1 e pelo link. Não o vê na lista geral de B1. |

Casos de borda (sugestão):
- Resposta oculta: some para os demais, sem marcador no lugar (o PRD só pede que deixe de aparecer). O contador de respostas desconta a oculta.
- **Resposta aceita oculta:** a pergunta volta a aparecer como "Com respostas" (ou "Sem respostas") para os demais. Se for restaurada, volta a ser a aceita. O autor da pergunta não é avisado (não há notificações no MVP).
- Pergunta oculta: as respostas ficam inacessíveis junto com ela.
- Autor de conteúdo oculto não é notificado por e-mail, pois o PRD não prevê notificações.

### 2.6 Autor de conta excluída (resolve pendência de HU-05 crit. 4)

**Sugestão:** o texto **"Conta excluída"**, com um avatar cinza neutro e ícone de pessoa (sem iniciais), no lugar do nome, em todos os pontos em que o nome aparece (lista, detalhe, respostas, post de time). Não é link. Em post de time continua aparecendo o time: "Time Pagamentos · Conta excluída". Razões: neutro, não sugere desligamento da empresa nem desentendimento, e diz de forma verdadeira o que aconteceu. Alternativas descartadas: "Anônimo" (o PRD proíbe posts anônimos como funcionalidade e a palavra confundiria), "Ex-colaborador" (pode ser falso). Decisão do usuário (P-15).
O leitor de tela lê "Autor: conta excluída".

### 2.7 Estados transversais (D1)

- **Carregando:** esqueletos de bloco para listas e detalhe; botões mostram indicador e texto de ação em andamento ("Publicando..."). Nada de tela em branco. Após 10 segundos sem resposta, aparece "Está demorando mais que o normal." com "Tentar de novo".
- **Erro de carregamento:** cartão com ícone de aviso, título "Algo deu errado", texto "Não foi possível carregar esta página." e botão "Tentar de novo". Se persistir: "Se o problema continuar, avise a equipe de TI."
- **Sem conexão:** faixa fixa no topo, "Você está sem conexão." O que foi digitado é mantido.
- **Sem permissão:** página com título "Você não tem acesso a esta página", texto "Esta área é só para administradores." e botão "Voltar ao início". Mesmo componente para qualquer rota restrita.
- **Conteúdo indisponível:** descrito em B5 e 2.5.
- **Sessão expirada (RNF-01):** ver A5.
- **Página não encontrada:** "Não encontramos esta página." com botão "Voltar ao início".
- **Disponibilidade (RNF-03, horário comercial, a confirmar):** se o sistema estiver fora do ar, a página de manutenção diz "O fórum está fora do ar agora. Volte no horário comercial." (a validar, depende da decisão de disponibilidade).

### 2.8 Textos da interface

Tom (vem do design system e do protótipo): simples, direto, em segunda pessoa ("você"), frases curtas, sem adjetivos de propaganda, sem emoji. Títulos em caixa de frase (só a primeira letra maiúscula). Rótulos de seção em maiúsculas e curtos. Mensagens de erro dizem o que aconteceu e o que fazer. Todos os textos deste documento são proposta e estão **a validar**.

Vocabulário fixo (consistência):
- "Pergunta", "Problema e solução", "Post de time" (tipos).
- "Publicar" (não "postar" nem "enviar") para criar conteúdo.
- "Ocultar" e "Restaurar" (nunca "apagar" nem "remover") para a moderação. "Excluir" só para conta.
- "Foi útil" para o voto.
- "Resposta aceita" e "Respondida".
- "Administrador" por extenso na tela; "admin" só nos documentos.

### 2.9 Acessibilidade (RNF-06)

- **Teclado:** tudo que o mouse faz, o teclado faz. Ordem de foco segue a leitura. Menus e janelas: abrem com Enter ou Espaço, navegação com setas, Esc fecha e devolve o foco ao botão que abriu. Janelas prendem o foco enquanto abertas. Abas com setas. Link "Pular para o conteúdo" no início da página.
- **Foco visível:** anel de 2 px na cor `tinta`, afastado 2 px, em todo controle (4.5). O protótipo usa anel verde, que tem só 2,3:1 sobre branco e foi trocado.
- **Contraste:** valores calculados na seção 4.4. Dois pares do protótipo não passam (texto branco sobre verde `#58BF62`, 2,3:1; texto `#3F8A47` sobre branco, 4,25:1) e foram substituídos.
- **Cor nunca é o único sinal:** selos de estado sempre têm texto, e os importantes têm ícone (check para aceita, relógio para pendente, olho riscado para oculto). Voto ativado muda ícone e texto, não só a cor.
- **Rótulos:** todo campo tem rótulo visível associado (`label`). Placeholders são exemplo, nunca o rótulo (o protótipo usa placeholders só como exemplo, no mesmo espírito). Erros ligados ao campo por `aria-describedby`, com `aria-invalid`. Resumo de erros recebe o foco ao enviar.
- **Anúncios:** alertas de sucesso e erro numa região `aria-live="polite"`. Mudanças de contagem de voto são anunciadas.
- **Imagens:** o MVP não tem imagens enviadas pelos usuários (sem anexos). Ícones decorativos têm `aria-hidden`; ícones que agem sozinhos (menu, buscar, "Mais ações") têm rótulo textual. A marca tem texto alternativo "Nome do produto, início". Se imagens em posts forem permitidas depois, o campo de texto alternativo vira obrigatório.
- **Alvos de toque:** mínimo de 44 x 44 px (protótipo usa 34 a 44; os botões de 34 px, como "Ver discussões", sobem para 44 no celular).
- **Texto:** mínimo de 14 px para texto corrido e de 12 px só para rótulos em maiúsculas. Zoom até 200% sem perda de conteúdo. Campos de formulário com 16 px no celular (evita ampliação automática no Safari).
- **Movimento:** transições curtas (150 ms) e desligadas com `prefers-reduced-motion`.

---

## 3. Visual: princípios

1. **Claro antes de bonito.** O fórum é uma ferramenta de trabalho para quem tem pressa de achar uma solução. Texto escuro sobre fundo branco, muito espaço, um verde de destaque.
2. **Uma cor só, usada com intenção.** O verde marca ação principal, estado "respondido" e foco de atenção. O resto é tinta, cinza e branco, como no design system.
3. **Formas arredondadas e consistentes.** Cartões de 20 px de raio, botões e campos de busca em pílula. Dá o tom amigável do protótipo.
4. **Hierarquia por peso e tamanho**, não por cor: títulos pesados (800), rótulos em maiúsculas com espaço entre letras, texto corrido leve.
5. **Acessível por padrão.** Onde o protótipo não passa no contraste, o design troca o valor e registra a mudança.

---

## 4. Visual: tokens e componentes

Os tokens abaixo seguem o IDE.IA (adotado, ver seção 1) e os valores vêm de `colors.css`, `typography.css` e `spacing.css`. Onde marcado **(novo)**, o token não existe no design system e é proposta minha, a validar. Nas telas, referencie sempre o token.

### 4.1 Cores

| Token | Valor | Origem | Uso |
| -- | -- | -- | -- |
| `cor-primaria` | `#58BF62` | IDE.IA `--green-600` | Preenchimento de botão principal, selo "Respondida", borda de resposta aceita, marca. **Nunca como cor de texto sobre branco.** |
| `cor-primaria-hover` | `#3F8A47` | `--green-700` | Não usar como fundo de botão com texto (nenhum par de texto passa em 4,5:1; ver 4.4). Serve para bordas e ícones de 3:1 ou mais. O hover do botão principal está descrito em 4.4 |
| `cor-primaria-suave` | `#CAEBCD` | `--green-200` | Fundo do voto ativado e do selo "Com respostas" |
| `cor-primaria-fundo` | `#EEF9EF` | `--green-100` | Fundo de hover de linha, bloco "Seus dados", citações |
| `cor-texto-verde` (novo) | `#2F6F37` | derivado de `--green-700`, escurecido | Tags, links e texto verde sobre branco ou `cor-primaria-fundo` |
| `cor-tinta` | `#22212C` | `--navy-900` | Texto sobre verde, botão escuro ("Buscar"), cartão escuro, anel de foco, avatar |
| `cor-tinta-elevada` | `#383741` | `--navy-800` | Painel sobre fundo escuro |
| `cor-texto` | `#1A1A1A` | `--gray-900` | Texto corrido |
| `cor-titulo` | `#000000` | `--black` | Títulos |
| `cor-texto-secundario` | `#5C5C5C` | `--gray-600` | Metadados, ajudas, legendas |
| `cor-borda` | `#E3E3E3` | `--gray-200` | Bordas de cartão e divisórias (decorativas) |
| `cor-borda-campo` (novo) | `#8A8A8A` | novo | Borda de campos, caixas de marcação e botões de contorno |
| `cor-fundo` | `#FFFFFF` | `--white` | Fundo de página e cartões |
| `cor-erro` (novo) | `#B3261E` | novo | Texto e borda de erro, botão de perigo |
| `cor-erro-fundo` (novo) | `#FDECEA` | novo | Fundo de alerta de erro |
| `cor-aviso-fundo` (novo) | `#FFF4D6` | novo | Fundo de alerta de atenção (texto em `cor-tinta`) |

O design system diz que há só uma cor de marca e nenhuma cor de estado. Um fórum com validação, erro e ação de perigo precisa de pelo menos um tom para erro; por isso `cor-erro` e `cor-aviso-fundo` são exceções funcionais, sempre acompanhadas de ícone e texto. Não há modo escuro no MVP (não pedido; pendência P-16). O cartão escuro de destaque é um recurso do protótipo, não um tema.

### 4.2 Tipografia

Família única: **Urbanist** (400, 500, 600, 700, 800, 900), arquivos `woff2` do design system, hospedados junto com o produto. Fallback `system-ui, sans-serif`. A fonte Olney do design system é de acento técnico e não é usada.

| Token | Desktop | Celular | Peso | Uso |
| -- | -- | -- | -- | -- |
| `texto-h1` | 44 / 1,1 | 30 / 1,15 | 800, espaçamento -0,02em | Título de página (protótipo: 40 a 44 px) |
| `texto-h1-detalhe` | 34 / 1,2 | 26 / 1,2 | 800 | Título de publicação |
| `texto-h2` | 26 | 22 | 800 | Título de seção |
| `texto-titulo-item` | 18 / 1,3 | 17 | 700 | Título na lista |
| `texto-corpo-leitura` | 17 / 1,6 | 17 / 1,6 | 400 | Texto de post e resposta |
| `texto-corpo` | 16 / 1,5 | 16 | 400 a 500 | Interface em geral e campos |
| `texto-meta` | 14 | 14 | 400 | Metadados e ajuda |
| `texto-rotulo` | 12, maiúsculas, espaçamento 0,1em | 12 | 700 | Rótulos de seção e selos (protótipo: 11 a 12 px; subi o mínimo para 12) |
| `texto-botao` | 15 a 16 | 16 | 700 | Botões |

O design system define tamanhos para slides (corpo de 22 px). Para a interface usei os valores do protótipo.

### 4.3 Espaçamento, forma e elevação

| Token | Valor | Uso |
| -- | -- | -- |
| `espaco-1` a `espaco-7` | 8, 16, 24, 32, 48, 64, 96 px | Escala do design system (`--space-1` a `--space-7`) |
| `espaco-meio` (novo) | 4 px e 12 px | Ajustes finos dentro de componentes |
| `raio-cartao` | 20 px | Cartões, listas, janelas (`--radius-card-dark`) |
| `raio-pilula` | 999 px | Botões, busca, selos, tags |
| `raio-campo-texto` | 18 px | Áreas de texto |
| `raio-pequeno` | 12 px | Marca, avatar quadrado, botões de ação em listas escuras |
| `raio-codigo` | 6 px | Código em linha |
| `borda-padrao` | 1 px `cor-borda` | Cartões |
| `borda-destaque` | 2 px `cor-primaria` | Resposta aceita e solução |
| `elevacao-flutuante` | 0 12px 32px rgba(0,0,0,.12) | Menus e popovers (do protótipo) |
| `elevacao-janela` | 0 16px 40px rgba(0,0,0,.16) | Janelas e folhas (do protótipo) |
| `largura-conteudo` | 1180 px | Máximo da página |
| `largura-leitura` | 760 px | Coluna principal do detalhe |
| `largura-formulario` | 820 px | Formulários de publicação |

Fundos são sólidos. Sem gradiente, como no design system. Sombra só em itens flutuantes; cartões usam borda.

### 4.4 Contraste (WCAG AA: 4,5:1 para texto, 3:1 para texto grande e para bordas de controles)

Calculado por mim com a fórmula de luminância relativa; a validar com uma ferramenta antes de implementar.

| Par (texto sobre fundo) | Razão | Resultado | Decisão |
| -- | -- | -- | -- |
| `cor-tinta` sobre `cor-primaria` | 6,8:1 | Passa | Texto de botão principal e selos verdes são **escuros** |
| Branco sobre `cor-primaria` (protótipo) | 2,3:1 | Falha | Trocado: o protótipo usa texto branco nos botões e selos verdes |
| `#3F8A47` (`--green-700`) sobre branco (protótipo: tags, links) | 4,25:1 | Falha para texto pequeno | Trocado por `cor-texto-verde` |
| `cor-texto-verde` sobre branco | 6,1:1 | Passa | Tags e links |
| `cor-texto-verde` sobre `cor-primaria-fundo` | 5,6:1 | Passa | Tags em linha com hover |
| `cor-texto-secundario` sobre branco | 6,7:1 | Passa | Metadados |
| `cor-texto` sobre branco | 17,4:1 | Passa | Corpo |
| `cor-primaria` sobre `cor-tinta` | 6,8:1 | Passa | Rótulos e botões sobre o cartão escuro |
| Branco 92% sobre `cor-tinta` | > 14:1 | Passa | Texto do cartão escuro |
| `cor-borda` (`#E3E3E3`) em campo de formulário (protótipo) | 1,3:1 | Falha (3:1 para componente) | Campos usam `cor-borda-campo` (3,4:1) |
| `cor-erro` sobre branco | 6,5:1 | Passa | Mensagens de erro |
| Anel de foco verde sobre branco (protótipo) | 2,3:1 | Falha | Anel em `cor-tinta` (sobre fundo escuro, o anel é `cor-primaria`, 6,8:1) |

Consequência para o botão principal: **fundo `cor-primaria` com texto `cor-tinta`** em todos os estados. No hover o fundo escurece para `cor-primaria-hover` e o texto continua escuro só se a razão passar de 4,5:1; como o par `#3F8A47` com `#22212C` não passa, no hover o botão usa **fundo `cor-primaria` com sublinhado e sombra interna de 2 px `cor-tinta`**, em vez de escurecer o fundo (a validar com o time visual). Isso muda a aparência em relação ao protótipo (branco sobre verde), e é a mudança visual mais visível deste documento; ver seção 8.

### 4.5 Estados de foco e interação

- **Foco (todos os controles):** anel de 2 px `cor-tinta`, com 2 px de distância (`outline-offset`). Sobre fundo escuro: `cor-primaria`.
- **Hover:** em itens de lista, fundo `cor-primaria-fundo`. Em botões de contorno, borda `cor-texto-verde`. Em links, sublinhado.
- **Pressionado:** sem deslocamento; o fundo escurece um passo.
- **Desabilitado:** texto e borda `cor-texto-secundario` a 60%, sem hover; sempre com texto de explicação próximo (evitar botão cinza sem motivo).
- **Erro:** borda do campo em `cor-erro` com 2 px, ícone de alerta e mensagem em `cor-erro` abaixo, ligada ao campo.

### 4.6 Selos (pílula, `texto-rotulo`)

| Selo | Aparência | Onde |
| -- | -- | -- |
| Tipo: PERGUNTA, PROBLEMA E SOLUÇÃO, POST DE TIME | Contorno `cor-borda-campo`, texto `cor-texto`, ícone de linha | Lista e detalhe |
| RESPONDIDA | Fundo `cor-primaria`, texto `cor-tinta`, ícone de check | Pergunta com resposta aceita |
| COM RESPOSTAS | Fundo `cor-primaria-suave`, texto `cor-texto-verde` | Pergunta com respostas e sem aceita |
| SEM RESPOSTAS | Fundo `cor-tinta`, texto branco | Pergunta sem respostas |
| RESPOSTA ACEITA | Igual a RESPONDIDA | Cartão de resposta |
| OCULTO | Fundo `cor-erro-fundo`, borda e texto `cor-erro`, ícone de olho riscado | Minhas publicações, admin |
| PEDIDO PENDENTE | Fundo `cor-aviso-fundo`, texto `cor-tinta`, ícone de relógio | Minha conta, admin |

Os três estados de pergunta (sem respostas, com respostas, respondida) reproduzem o esquema de cores do protótipo (Sem resposta, Em análise, Respondida), com os rótulos trocados e o texto escuro sobre verde.

### 4.7 Componentes (só os que as telas usam)

| Componente | Variações e estados | Telas |
| -- | -- | -- |
| **Botão primário** | Pílula, 44 a 56 px de altura, fundo `cor-primaria`, texto `cor-tinta` 700. Estados: padrão, hover, foco, carregando (indicador e texto de andamento), desabilitado | Todas |
| **Botão escuro** | Fundo `cor-tinta`, texto branco. Uso: "Buscar" | B1 |
| **Botão de contorno** | Fundo branco, borda `cor-borda-campo`, texto `cor-texto` 600 | Cancelar, Compartilhar |
| **Botão de perigo** | Fundo `cor-erro`, texto branco (6,5:1). Uso: "Enviar pedido" de exclusão, "Excluir conta". Sempre dentro de uma janela de confirmação, com o foco inicial em "Cancelar" | B10, C1 |
| **Botão de texto** | Sem fundo, `cor-texto-verde`, 700 | "Carregar mais", "Tentar de novo" em contexto |
| **Campo de texto e de busca** | Pílula (busca e título) com 48 a 56 px; borda `cor-borda-campo`; rótulo visível 16 px 800; ajuda abaixo em `texto-meta`; erro abaixo em `cor-erro` com ícone | A1, A5, B1, B2, B3, B4 |
| **Área de texto** | 18 px de raio, redimensionável na vertical, contador quando houver limite | B2, B3, B4, B5, B7, B8 |
| **Campo de tags** | Campo com pílulas removíveis (cada uma com "×" e rótulo "Remover tag X"). Ao digitar, lista de sugestões de tags existentes (HU-11 crit. 2) navegável por setas; Enter ou vírgula adiciona. Estados: carregando sugestões ("Buscando tags..."), sem sugestões (mostra "Criar tag 'x'"), limite atingido ("Máximo de 5 tags"), formato inválido ("Use letras, números e hífen") | B2, B3, B4, B7 |
| **Lista suspensa com busca** | Para time e para promover admin. Teclado: setas, Enter, Esc | B4, C1 |
| **Caixa de marcação e botão de rádio** | 24 px, borda `cor-borda-campo`, marcação com ícone (não só cor) | A1, B8, B10 |
| **Cartão** | Borda `borda-padrao`, `raio-cartao`, preenchimento 20 a 24 px | Todas |
| **Cartão escuro** | Fundo `cor-tinta`, rótulo em `cor-primaria`, texto branco | B1 ("Resolveu um problema?") |
| **Item de lista** | Descrito em B1 | B1, B9, C1 |
| **Tag** | Texto `cor-texto-verde` 600, com "#" como prefixo visual; é um link; hover sublinhado | Lista, detalhe |
| **Selo** | Seção 4.6 | Lista, detalhe, admin |
| **Avatar** | Círculo de 30 a 34 px, iniciais em branco sobre `cor-tinta`. Autor de conta excluída: círculo `cor-borda` com ícone de pessoa | Detalhe, lista |
| **Botão de voto** | Pílula "Foi útil · N", alternância com `aria-pressed` | B5, B6 |
| **Menu "Mais ações"** | Botão de 44 px com ícone de três pontos e rótulo "Mais ações"; popover com itens de 44 px | Detalhe |
| **Alerta (em linha)** | Variações: informação (fundo `cor-primaria-fundo`), sucesso (idem, com check), atenção (`cor-aviso-fundo`), erro (`cor-erro-fundo`). Sempre ícone e texto, `role="status"` ou `role="alert"` conforme a urgência | Todas |
| **Aviso de confirmação (toast)** | Canto inferior, 5 segundos, com botão "Fechar" e ação opcional ("Desfazer"), em `aria-live="polite"`; não é o único canal para erro | Após ações |
| **Janela** | 480 a 560 px, `raio-cartao`, `elevacao-janela`, fundo de página escurecido (70%), foco preso, Esc fecha. No celular vira folha inferior de largura total | B8, B10, C1, C2 |
| **Abas** | `role="tablist"`, aba ativa com borda inferior de 2 px `cor-primaria` e peso 800 (como o menu do protótipo) | C1 |
| **Esqueleto** | Blocos `cor-borda`, com `raio-cartao` nos cartões, sem animação | Carregando |
| **Estado vazio** | Ícone de linha de 48 px (traço de 3 px, estilo de ícone do design system), título, texto e botões | Listas |
| **Faixa de conteúdo oculto** | Fundo `cor-erro-fundo`, ícone, texto e, para admin, botão "Restaurar" | Detalhe |
| **Linha de tabela de admin** | Colunas em tela larga, vira cartão empilhado abaixo de 640 px | C1 |
| **Indicador de carregando** | Círculo giratório de 20 px; texto junto | Botões |

Ícones: o design system só traz seis ícones oficiais (fechar, check, janela de código, navegador, monitor, USB) e dois pacotes maiores de ícones de linha. O fórum precisa de outros (buscar, menu, três pontos, seta para cima, editar, bandeira de denúncia, olho riscado, relógio, aviso, pessoa). **Sugestão:** usar um conjunto de ícones de linha com traço arredondado de 2 px, na cor `cor-tinta` (o verde `#58BF62` sobre branco tem só 2,3:1 e não atende o mínimo de 3:1 para ícones que agem sozinhos). A escolha do conjunto é pendência (P-17). Sem emoji, como no design system.

---

## 5. Cobertura

| História | Telas e fluxos | Status |
| -- | -- | -- |
| HU-01 Criar conta | A1, fluxo 1 | Coberta |
| HU-02 Confirmar e-mail | A2, A3, A4 | Coberta (prazo do link a definir) |
| HU-03 Aviso de privacidade | A1 (bloco "Seus dados") | Coberta (texto é sugestão) |
| HU-04 Pedir exclusão da conta | B10 | Coberta |
| HU-05 Excluir contas a pedido | C1 aba Pedidos de exclusão, 2.6 | Coberta (texto no lugar do autor é sugestão) |
| HU-06 Publicar problema e solução | B2, B1 (lista vazia) | Coberta (limite de texto a definir; campo "Título" é sugestão) |
| HU-07 Publicar pergunta | B3 | Coberta |
| HU-08 Responder | B5 | Coberta |
| HU-09 Editar o próprio conteúdo | B7, B9 | Coberta |
| HU-10 Buscar | B1 | Coberta |
| HU-11 Tags | B2, B3, B4, B7 (campo de tags) | Coberta (limite e formato a definir) |
| HU-12 Filtrar por tag | B1 | Coberta |
| HU-13 Votar | B5, B6 | Coberta (voto no próprio conteúdo é sugestão) |
| HU-14 Resposta aceita | B5 | Coberta (aceitar outra é sugestão) |
| HU-15 Ocultar e restaurar | C2, C1 aba Ocultos, 2.5 | Coberta (visão do autor é sugestão) |
| HU-16 Denunciar | B8, C1 aba Denúncias | Coberta (destino da denúncia é sugestão) |
| HU-17 Promover admin | C1 aba Administradores | Coberta |
| HU-18 Post de time | B4, B6 | Coberta (lista de times e vínculo a definir) |

Não funcionais: RNF-01 (A4, A5, D1), RNF-02 (B1, estado carregando), RNF-04 (A1, B10), RNF-05 (todos os textos), RNF-06 (2.9, 4.4, versão para celular em 2.3 e nas telas).

Telas sem história própria, propostas por mim e marcadas como sugestão: A5 (entrar), B9 (minhas publicações), bloco "Talvez já esteja respondido" em B3, ação "Dispensar denúncia", coluna "Mais com as mesmas tags" e o trecho de 2 linhas nos itens da lista. Todas podem ser removidas sem quebrar as histórias, exceto A5 (sem ela quem já tem conta não consegue voltar).

---

## 6. Pendências

**Precisam de decisão do usuário (produto):**
- **P-01 Como quem já tem conta volta a entrar.** Proposta: link de acesso por e-mail (A5), coerente com "só nome e e-mail". A decisão técnica é do `solutions-architect`.
- **P-02 Nome e marca do produto.** O protótipo usa "SynchroMind" e um "S" em quadrado verde; o PRD só diz "Fórum interno de conhecimento". Preciso do nome e do logotipo definitivos (o `logo.png` do zip é azul e dourado e não combina com o IDE.IA).
- **P-05 Campo "Título" em problema e solução.** Não está em HU-06, mas a busca por título (RNF-02) e a lista pedem.
- **P-08 Voto no próprio conteúdo** (HU-13 crit. 4). Sugestão: não permitir.
- **P-09 Aceitar outra resposta** (HU-14 crit. 3). Sugestão: trocar, com uma só aceita.
- **P-11 "Dispensar denúncia".** Fora das histórias, mas a lista de denúncias abertas não esvazia sem ela.
- **P-14 Motivo ao ocultar.** Sugestão: sem motivo no MVP.
- **P-15 Texto no lugar do autor de conta excluída.** Sugestão: "Conta excluída".
- **Texto de "Minhas publicações" (B9)** e a regra de visão do autor sobre conteúdo oculto (2.5).

**Dependem do arquiteto ou da TI:**
- **P-03** Domínio de e-mail da empresa (A1).
- **P-04** Quem cadastra os times e como a pessoa se liga a um time (HU-18). Sugestão: TI cadastra, todos podem escolher qualquer time.
- **P-06** Limites de tamanho de texto, número e formato de tags, validade do link (HU-01, HU-02, HU-06, HU-11).
- **P-07** Formatação de texto (texto simples ou formato mínimo com código).
- **P-12** Regra para excluir conta de admin, principalmente o último.
- **P-13** Rebaixar admin (sem história).
- Primeiro admin: tarefa técnica da 1ª entrega, sem tela.
- Texto final do aviso de privacidade: precisa de quem responde pelos dados na empresa (pergunta aberta do PRD).
- Disponibilidade e página de manutenção (RNF-03).
- Visibilidade do e-mail para admins: o design mostra o e-mail aos admins em C1 e o aviso de privacidade diz isso. Confirmar.

**Outras:**
- **P-10** Cancelar um pedido de exclusão (sem história).
- **P-16** Modo escuro (não pedido).
- **P-17** Conjunto de ícones.
- Decidir se a decisão visual de trocar texto branco por texto escuro nos botões verdes (4.4) é aceita, ou se a empresa prefere manter o branco do protótipo e escurecer o verde dos botões (por exemplo `#2F6F37`).
- Validar o ponto de quebra e o comportamento no celular com pessoas reais, já que o protótipo não tem versão para celular.
- Métricas de usabilidade: nenhuma existe ainda; o PRD define metas só depois de 4 semanas.

---

## 7. Resumo do que fica em aberto

Em uma frase: o fluxo e as telas cobrem as 18 histórias; o usuário precisa decidir sobre o nome da marca, o login de quem volta, o "Título" nos posts de solução, e as regras de borda marcadas como sugestão (voto no próprio conteúdo, trocar a resposta aceita, destino da denúncia, texto de conta excluída e o que o autor vê do conteúdo oculto).

---

## 8. Divergências em relação ao protótipo

O que o protótipo tem e o MVP não inclui, ou o que foi adaptado:

| Item do protótipo | O que foi feito | Decisão que cabe ao usuário |
| -- | -- | -- |
| Agente flutuante "Synchropédia" (botão fixo, painel de ações automáticas e chat) | Não desenhado. O PRD não prevê agente de IA | Incluir depois? |
| Cartão "Seus assuntos" (respostas novas da semana nas tags que a pessoa segue) | Não desenhado. Não há "seguir" assunto no PRD | Incluir depois? |
| "Acompanhando" (contagem de seguidores) nos itens da lista | Trocado por votos e respostas | Incluir "seguir" depois? |
| Perguntas e respostas **anônimas** ("Anônimo", "Responder como anônimo", "Publicar como") | Não desenhado: posts anônimos são não objetivo do PRD. "Publicar como" virou a escolha do time em B4 | Revisar o não objetivo? |
| "Complementos" nas respostas | Não desenhado. O PRD só tem pergunta, resposta e voto | Incluir comentários depois? |
| Filtro "Somente sem resposta" | Não desenhado. Para achar perguntas sem resposta, o selo "Sem respostas" aparece na lista | Incluir como filtro? |
| Coluna lateral "Quem contribui nesse assunto" e ranking de pessoas | Não desenhado. Não há perfis nem ranking | Incluir depois? |
| Gerência da pessoa abaixo do nome no cabeçalho e "Gerência" na linha de metadados | Removido. Não há gerência no PRD; o nome aparece sozinho | Incluir depois? |
| Texto branco sobre verde nos botões, selos e voto ativo | **Alterado para texto escuro sobre verde**, por contraste (2,3:1 no protótipo, 6,8:1 aqui) | Aceitar a mudança ou manter o branco e escurecer o verde? |
| Tags em `#3F8A47` e anel de foco verde | Alterados para `#2F6F37` e anel escuro, por contraste e acessibilidade | Aceitar? |
| Bordas de campos em cinza claro (`#E3E3E3`) | Escurecidas para `#8A8A8A` (3:1 de contraste em componentes) | Aceitar? |
| Largura mínima de 1180 px (só desktop) | Adicionada versão de celular a partir de 360 px, com folha de filtros, botão flutuante "Publicar" e janelas em folha inferior | Validar com pessoas que usam o celular |
| Filtros "da IA" (assunto, módulo, gerência) na lista | Trocados por filtros de tipo e tag (as tags são escolhidas pelas pessoas) | Aceitar? |
| "Talvez já esteja respondido" (sugestões na tela de pergunta) | Adaptado sem IA, como busca por palavras do título. Sugestão opcional, fora das histórias | Manter ou remover? |
| Tela de detalhe com cartão "Próximo passo" e dados da discussão | Mantido só o cartão de dados ("Sobre esta pergunta") | Aceitar? |
| Cores de erro, aviso e perigo | Adicionadas (o design system só tem verde e tinta), sempre com ícone e texto | Aceitar? |

---

## 9. Próximo passo

Se o documento estiver bom, o `solutions-architect` pode decidir login (P-01), regras de limite (P-06) e o vínculo dos times (P-04). Depois disso, os textos marcados a validar e o conjunto de ícones fecham a frente visual.
