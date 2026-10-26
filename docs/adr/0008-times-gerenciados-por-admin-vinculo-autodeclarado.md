# ADR-0008: Lista de times gerida por admins e vínculo de membro autodeclarado

- **Status:** Proposto
- **Data:** 2026-10-26
- **Decisores:** Equipe Synpower (a confirmar com a TI e o responsável pelo produto)

## Contexto
> Atualização 2026-10-26 (mudança de produto, status inalterado): publicar em nome de um time passou a ser opcional, no mesmo formulário do post (`team_id` opcional; sem time, o post só tem o autor). O tipo `team` deixou de existir. A exigência de o autor ser membro do time escolhido continua valendo. A tela de vínculo usuário-time ainda não existe nas histórias (HU-18, critério 3), o que está em aberto.

HU-18 e RF-03: o usuário, ao criar um post, escolhe opcionalmente um time numa lista e publica em nome dele, e o post aparece identificado com o time e com o autor. O planejamento deixa em aberto quem cadastra os times e como o usuário se liga a um time. Não existe diretório corporativo informado. Com 2 a 3 admins e até 500 pessoas, manter o vínculo de cada pessoa à mão seria um gargalo.

## Decisão
Admins criam, renomeiam e desativam times (por API ou importação inicial pela TI). Cada usuário marca os times de que participa; só pode publicar em nome de um time ao qual se declarou membro (a escolha de time é opcional; sem time, nenhuma checagem de vínculo). A API devolve 403 `not_team_member` se o `team_id` for de um time em que o autor não é membro. O post mostra time e autor, então há responsabilização. Admins podem remover um membro e podem ocultar o post (RF-11). Desativar um time não apaga seus posts.

## Alternativas consideradas
- **Qualquer usuário publica em nome de qualquer time (sem vínculo):** é a mais simples e atende o texto literal do PRD, mas facilita publicar em nome de um time que não é o seu. Descartada, pelo custo baixo de um vínculo.
- **Admin gerencia cada vínculo:** controle total, mas o trabalho recai sobre 2 ou 3 pessoas. Fica como evolução se houver abuso.
- **Importar times e membros de um diretório (AD, Google, RH):** o melhor dado, mas o PRD descarta integrações e não informa que o diretório exista.
- **Qualquer usuário cria times:** gera times duplicados e ruído. Descartada.

## Consequências
- **Positivas:** poucas ações de admin; a regra de publicação é simples de validar no servidor.
- **Negativas / custos:** o vínculo é autodeclarado, não verificado; a lista inicial precisa de alguém da TI. Sem uma tela de vínculo, a regra de membro bloqueia na prática a publicação em nome de time: só publica quem tiver vínculo carregado pela TI ou criado por chamada direta à API.
- **Riscos e gatilho de revisão:** se houver publicação em nome de time indevido, passar para vínculo gerido por admin ou importado.

## Questões em aberto
- Quais são os times iniciais, e quem da TI os cadastra? Um usuário pode pertencer a mais de um time (premissa adotada: sim)?
- **Tela de vínculo usuário-time (produto):** nenhuma história cobre a tela em que o usuário marca seus times; HU-18, critério 3, segue "A definir". Opções: criar a história (mantém o vínculo autodeclarado), ou o admin vincular (alternativa já listada acima), ou dispensar a exigência de membro (mais simples, mas reabre o risco de publicar em nome de time alheio). Mantida a exigência até o produto decidir.
- Pergunta com `team_id`: o desenho recusa (422), porque RF-03 fala em "post". Confirmar.

## Relacionados
- RF-03, HU-18; ADR-0005 (membro excluído sai do time).
