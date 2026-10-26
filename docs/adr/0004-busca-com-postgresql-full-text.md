# ADR-0004: Implementar a busca com o full-text search do PostgreSQL

- **Status:** Proposto
- **Data:** 2026-10-26
- **Decisores:** Equipe Synpower (a confirmar)

## Contexto
> Atualização 2026-10-26 (mudança de produto, status inalterado): o post passou a ter um só formato livre (título, texto e tags) e os tipos são `post` e `question`; "problema" e "solução" deixaram de ser campos, então o "texto" do vetor é o `body`. O usuário confirmou que a busca inclui o texto das respostas (RF-06, HU-10).

RNF-02: resultados em até 2 s para pelo menos 95% das buscas; encontrar o termo no título, no texto, nas tags e no texto das respostas, ignorando acentos e maiúsculas; ordenar por relevância e, em empate, por votos (HU-10). O volume de conteúdo não foi informado; o PRD prevê 10 a 15 itens de carga inicial e uso por poucas centenas de pessoas.

## Decisão
Usar o full-text search do PostgreSQL: uma configuração de busca própria em português que aplica `unaccent` antes do stemmer, uma coluna `tsvector` gerada e armazenada na tabela de posts (título com peso A, tags com peso B, texto `body` com peso C), índice GIN, consulta com `websearch_to_tsquery` e ordenação por `ts_rank_cd` desc, votos desc, data desc. Itens ocultos ficam fora dos resultados. O filtro por tipo (`kind=post|question`) combina com `q` e `tag` e não altera o vetor.

A busca também cobre o texto das respostas (confirmado pelo usuário). Há duas formas de fazer, e a escolha fica para a implementação, junto com a decisão de entrega abaixo:
- **A. Respostas no vetor do post:** o texto das respostas visíveis entra no `search_vector` do post com peso D, mantido pela aplicação na mesma transação que cria, edita, oculta ou restaura a resposta. Uma consulta só, sem junção; custo: reescrever o vetor do post a cada mudança de resposta.
- **B. Vetor próprio em `answers`:** índice GIN em cada resposta; a busca une os posts que casam diretamente com os posts cujas respostas visíveis casam, e o ranking usa o maior dos dois. Sem reescrita do post; custo: consulta mais complexa e ranking a definir.
Em qualquer das duas, resposta oculta não pode fazer o post aparecer nem pesar no ranking (ADR-0009).

## Alternativas consideradas
- **`ILIKE '%termo%'` com `unaccent`:** zero configuração, mas faz varredura da tabela, não ordena por relevância e não faz stemming (busca "solução" não acha "soluções"). Serve só para o volume do seed; descartada.
- **Meilisearch, Typesense ou OpenSearch:** relevância, tolerância a erro de digitação e destaque de trecho melhores. Pagam um serviço a mais para operar, sincronização com o banco e mais um ponto de falha. Sem requisito de tolerância a erros de digitação nem de volume que o justifique, descartados.
- **Extensão `pg_trgm` (similaridade por trigramas):** boa para erros de digitação, ruim para relevância de texto longo. Fica como complemento possível, não como base.

## Consequências
- **Positivas:** sem serviço novo; busca e dados na mesma transação (o item ocultado some do resultado na hora); o RNF-02 é verificável com um teste de carga sobre dados sintéticos.
- **Negativas / custos:** relevância menos sofisticada que um motor dedicado; a configuração de busca e a coluna gerada são migração de banco a escrever com cuidado. Detalhe importante: a função `unaccent` não é imutável, por isso a configuração de busca a usa como dicionário em vez de a coluna gerada chamá-la diretamente. Não verificado em execução: validar em um teste rápido de migração antes de fixar.
- **Riscos e gatilho de revisão:** medir p95 da rota de busca desde o primeiro dia. Reabrir se o p95 passar de 2 s com dados reais, ou se os usuários pedirem tolerância a erros de digitação. Se o texto das respostas ficar fora da 1ª entrega, a busca dessa entrega não acha um post só pelo que está nas respostas (ver pergunta em aberto).

## Questões em aberto
- Respondido pelo usuário: **sim**, a busca inclui o texto das respostas, porque a solução de uma pergunta mora na resposta; a decisão acima já reflete isso. **Pergunta ao produto:** entra já na 1ª entrega ou numa seguinte? O arquiteto recomendava depois do MVP (a 1ª entrega já traz HU-10 com título, texto e tags); o produto decide, e o critério 1 de HU-10 só fica cumprido por inteiro quando as respostas entrarem.
- Volume esperado de posts (TI/produto) para dimensionar o teste de carga.
- A extensão `unaccent` está disponível no PostgreSQL da hospedagem? Não verificado.

## Relacionados
- RF-06, RF-07, HU-10, HU-12; RNF-02; ADR-0001.
