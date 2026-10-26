# ADR-0009: Moderar por ocultação lógica, com histórico de ações

- **Status:** Proposto
- **Data:** 2026-10-26
- **Decisores:** Equipe Synpower (a confirmar)

## Contexto
> Atualização 2026-10-26 (mudança de produto, status inalterado): os tipos de post passaram a ser `post` e `question`; a ocultação vale igual para os dois e não depende do tipo. A regra de que resposta oculta não entra na busca (ADR-0004, texto das respostas) segue a mesma consulta de visibilidade.

RF-11 e HU-15: o admin oculta e restaura qualquer post, pergunta ou resposta, sem editar o texto de outros; o conteúdo oculto some para os demais usuários e pode voltar. HU-16: denúncias vão para uma lista dos admins. Regras de borda ainda "A definir": o que o autor vê do próprio conteúdo oculto e o que acontece com a denúncia depois de ocultar.

## Decisão
Posts e respostas têm colunas `hidden_at`, `hidden_by` e `hidden_reason`; oculto é um estado, não uma exclusão. Regras adotadas:
- Usuário comum recebe 404 para conteúdo oculto de outra pessoa, e ele não entra em listas, contagens nem busca. Ocultar uma pergunta oculta toda a discussão dela.
- O autor continua vendo o próprio conteúdo oculto, marcado como "oculto pela moderação", e não pode editá-lo.
- Admin vê tudo e filtra por `status=hidden`; não edita texto de outros.
- Ao ocultar, as denúncias abertas daquele item passam a `actioned` na mesma transação; restaurar não as reabre.
- Toda ação de moderação (ocultar, restaurar, promover, excluir conta, resolver denúncia) grava uma linha em `audit_log`.

## Alternativas consideradas
- **Excluir fisicamente o conteúdo ocultado:** contraria "restaurar" (RF-11).
- **Mover o conteúdo oculto para outra tabela:** complica listas e restauração sem ganho.
- **Sem histórico de auditoria:** menos tabelas, mas ninguém poderia responder "quem ocultou isto e por quê", com poder concentrado em poucos admins.

## Consequências
- **Positivas:** reversível, simples, uma transação por ação; o autor entende por que sumiu.
- **Negativas / custos:** todas as consultas de leitura precisam filtrar por visibilidade (concentrar num único ponto do código e testar); o motivo da ocultação fica visível só a admins.
- **Riscos e gatilho de revisão:** revisar se for necessário notificar o autor (e-mail) ou permitir contestação.

## Questões em aberto
- Confirmar as quatro regras de borda acima com o responsável do produto.

## Relacionados
- RF-11, RF-12, HU-15, HU-16; ADR-0005.
