# ADR-0005: Excluir a conta removendo a linha do usuário e desvinculando o conteúdo

- **Status:** Proposto
- **Data:** 2026-10-26
- **Decisores:** Equipe Synpower (a confirmar); validação de privacidade por quem for o responsável pelos dados (ainda não indicado)

## Contexto
RF-15 e HU-05: após a exclusão pelo admin, o usuário não entra mais, nome e e-mail são removidos, e posts, perguntas e respostas continuam visíveis sem identificação do autor. A empresa não tem jurídico nem DPO (RNF-04). Isto é um desenho técnico, não um parecer jurídico.

## Decisão
Excluir de fato a linha do usuário. Todas as chaves estrangeiras que apontam para ele são `ON DELETE SET NULL` (autor de posts e respostas, votos, denúncias, ator de ações de moderação, quem aprovou pedidos) ou `ON DELETE CASCADE` (sessões, tokens de acesso, vínculo com times). A API devolve `author: null` e o frontend mostra o texto escolhido pelo produto. Votos ficam com `user_id` nulo para a contagem não mudar. O pedido de exclusão fica registrado sem referência ao usuário (só datas e estado). A operação é uma transação única, executada pelo admin; não se pode excluir o último admin.

## Alternativas consideradas
- **Manter a linha e trocar nome e e-mail por valores fictícios (lápide):** simples, mas mantém o vínculo `author_id`, então todos os posts de uma pessoa continuam agrupáveis e, em tese, reidentificáveis pelo conjunto. Não cumpre bem "sem identificação do autor". Descartada.
- **Excluir também o conteúdo:** é o mais fácil de defender sobre privacidade, mas contradiz RF-15 e apaga conhecimento, o objetivo do fórum. Descartada.
- **Soft delete (marcar `deleted_at` e esconder nome na API):** os dados pessoais continuariam no banco, contra RF-15. Descartada.

## Consequências
- **Positivas:** a remoção é real e não depende de a API "lembrar" de esconder o campo; o conjunto de regras fica nas restrições do banco.
- **Negativas / custos:** a operação é irreversível; o autor não pode mais editar o conteúdo; a lista de times perde o membro. O texto livre escrito pelo usuário pode conter nome (risco já registrado no PRD); os admins podem ocultar casos específicos.
- **Riscos e gatilho de revisão:** o e-mail ainda pode existir em backups do banco, em logs do servidor web e no relay de e-mail. A empresa precisa decidir retenção desses itens. Revisar se aparecer exigência de um responsável pelos dados.

## Questões em aberto
- Quem responde pelos dados pessoais do fórum (PRD, pergunta em aberto)?
- Texto exibido no lugar do autor (HU-05, critério 4).
- Retenção de backups e de logs do servidor web.
- Pedido de exclusão pode ser recusado ou cancelado pelo usuário? O PRD só cita atender.

## Relacionados
- RF-15, HU-04, HU-05; RNF-04; ADR-0009.
