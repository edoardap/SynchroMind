# Planejamento: Fórum interno de conhecimento

## Visão geral
6 épicos e 18 histórias, cobrindo RF-01 a RF-15. O **MVP (Essenciais)** são as histórias HU-01, 02, 06, 07, 08, 10 e 15. As demais são Importantes e entram na 2ª e 3ª entregas, como no PRD. Não há estimativas de prazo, porque o PRD ainda não tem datas.

## Critérios transversais
- **RNF-01:** só quem tem conta com e-mail confirmado vê o conteúdo. Vale para todas as histórias, exceto HU-01 e HU-02.
- **RNF-02:** a busca responde em até 2 s em 95% das buscas. Vale para HU-10 e HU-12.
- **RNF-04:** o sistema guarda só nome e e-mail. Vale para HU-01, HU-03, HU-04 e HU-05.
- **RNF-05:** interface em português do Brasil (sugestão do PRD, a confirmar).
- **RNF-06:** navegadores atuais (Chrome, Edge, Firefox, Safari), uso em tela de 360 px ou mais, e acessibilidade básica (teclado, contraste, texto alternativo). Vale para todas as telas.
- **RNF-03:** disponibilidade em horário comercial. Vale para o sistema todo.

## Épico 1: Cadastro e acesso
Entrar no fórum com a conta da empresa e ter controle sobre os próprios dados.

### HU-01: Criar conta com e-mail da empresa
- **Origem:** RF-01
- **Prioridade:** Essencial
- **História:** Como funcionário, quero criar uma conta com meu e-mail da empresa, para acessar o conhecimento compartilhado.
- **Critérios de aceite:**
  1. Dado um e-mail do domínio da empresa, quando envio nome e e-mail, então a conta é criada como não confirmada.
  2. Dado um e-mail de outro domínio, quando tento me cadastrar, então vejo a mensagem de que só e-mails da empresa são aceitos.
  3. Dado um e-mail já cadastrado, quando tento me cadastrar de novo, então vejo aviso de que a conta já existe.
  4. Dado dados obrigatórios ausentes, quando envio o formulário, então vejo quais campos faltam.
- **Depende de:** nenhuma

### HU-02: Confirmar o e-mail por link
- **Origem:** RF-01
- **Prioridade:** Essencial
- **História:** Como funcionário, quero confirmar meu e-mail, para provar que a conta é minha e liberar o acesso.
- **Critérios de aceite:**
  1. Dado uma conta não confirmada, quando clico no link recebido por e-mail, então a conta é confirmada e consigo acessar o fórum.
  2. Dado uma conta não confirmada, quando tento acessar o fórum, então o acesso é bloqueado com aviso para confirmar o e-mail.
  3. Dado um link expirado ou já usado, quando clico nele, então vejo o aviso e posso pedir um novo link.
  4. Validade do link: A definir.
- **Depende de:** HU-01

### HU-03: Ver aviso de privacidade no cadastro
- **Origem:** RF-14
- **Prioridade:** Importante
- **História:** Como funcionário, quero saber quais dados meus são usados e por quem, para decidir com informação.
- **Critérios de aceite:**
  1. Dado a tela de cadastro, quando ela é aberta, então vejo o aviso de privacidade.
  2. Dado que não reconheci o aviso, quando tento concluir o cadastro, então o cadastro não é concluído.
  3. Texto do aviso: A definir.
- **Depende de:** HU-01

### HU-04: Pedir a exclusão da minha conta
- **Origem:** RF-15
- **Prioridade:** Importante
- **História:** Como usuário, quero pedir a exclusão da minha conta, para ter meus dados pessoais removidos.
- **Critérios de aceite:**
  1. Dado que estou logado, quando peço a exclusão, então vejo o aviso de que meus posts e respostas continuam sem meu nome e confirmo o pedido.
  2. Dado que confirmei, quando o pedido é enviado, então ele aparece na lista de pedidos dos admins e vejo que está pendente.
  3. Dado um pedido pendente, quando peço de novo, então vejo que já existe um pedido.
- **Depende de:** HU-02

### HU-05: Excluir contas a pedido
- **Origem:** RF-15
- **Prioridade:** Importante
- **História:** Como admin, quero tratar os pedidos de exclusão, para atender o usuário.
- **Critérios de aceite:**
  1. Dado um pedido pendente, quando o admin o aprova, então nome e e-mail do usuário são removidos e ele não consegue mais entrar.
  2. Dado uma conta excluída, quando outro usuário vê o conteúdo dela, então os posts, perguntas e respostas continuam visíveis sem identificação do autor.
  3. Dado um usuário comum, quando acessa a lista de pedidos, então não vê essa opção.
  4. Texto exibido no lugar do autor: A definir.
- **Depende de:** HU-04, HU-15

## Épico 2: Compartilhar e perguntar
Registrar soluções e tirar dúvidas, para o conhecimento sair de quem o tem.

### HU-06: Publicar um post sobre qualquer tema da empresa
- **Origem:** RF-02
- **Prioridade:** Essencial
- **História:** Como funcionário, quero publicar um post sobre qualquer tema da empresa (uma solução que encontrei, uma novidade, um aprendizado), para que o conhecimento chegue a quem precisa.
- **Critérios de aceite:**
  1. Dado que estou logado, quando preencho título e texto e publico, então o post aparece na lista com meu nome.
  2. Dado título ou texto vazios, quando tento publicar, então vejo qual campo falta e nada é publicado.
  3. Dado que não há posts, quando abro a lista, então vejo uma mensagem de lista vazia.
  4. Limite de tamanho do texto: A definir.
- **Depende de:** HU-02

### HU-07: Publicar uma pergunta
- **Origem:** RF-04
- **Prioridade:** Essencial
- **História:** Como funcionário, quero publicar uma pergunta, para receber ajuda de quem já passou pelo problema.
- **Critérios de aceite:**
  1. Dado que estou logado, quando preencho título e descrição e publico, então a pergunta aparece na lista e aceita respostas.
  2. Dado título ou descrição vazios, quando tento publicar, então vejo qual campo falta.
- **Depende de:** HU-02

### HU-08: Responder a uma pergunta
- **Origem:** RF-05
- **Prioridade:** Essencial
- **História:** Como funcionário, quero responder a uma pergunta, para compartilhar o que sei.
- **Critérios de aceite:**
  1. Dado uma pergunta, quando escrevo e envio uma resposta, então ela aparece abaixo da pergunta com meu nome.
  2. Dado uma resposta vazia, quando envio, então nada é publicado e vejo o aviso.
  3. Dado uma pergunta com várias respostas, quando a abro, então vejo todas.
- **Depende de:** HU-07

### HU-09: Editar o próprio conteúdo
- **Origem:** RF-10
- **Prioridade:** Importante
- **História:** Como autor, quero corrigir o que publiquei, para manter a informação certa.
- **Critérios de aceite:**
  1. Dado um conteúdo meu, quando edito e salvo, então a alteração aparece para todos.
  2. Dado um conteúdo de outra pessoa, quando o abro, então não vejo opção de editar.
  3. Dado um texto vazio, quando salvo a edição, então a alteração é recusada com aviso.
- **Depende de:** HU-06, HU-07, HU-08

## Épico 3: Encontrar conhecimento
Achar rápido soluções que já existem na empresa.

### HU-10: Buscar por palavra-chave
- **Origem:** RF-06
- **Prioridade:** Essencial
- **História:** Como funcionário, quero buscar por uma palavra, para descobrir se alguém já resolveu o meu problema.
- **Critérios de aceite:**
  1. Dado um termo presente no título, texto ou tags de um post, ou no texto de uma resposta, quando busco, então o post aparece nos resultados.
  2. Dado uma busca sem acento ou com maiúsculas diferentes (ex.: "solucao"), quando busco, então acho "solução".
  3. Dados vários resultados, quando a lista aparece, então vem ordenada por relevância e, em empate, por mais votos.
  4. Dado um termo sem resultados, quando busco, então vejo a mensagem de nenhum resultado.
  5. Ver RNF-02.
- **Depende de:** HU-06, HU-07

### HU-11: Marcar um post com tags
- **Origem:** RF-07
- **Prioridade:** Importante
- **História:** Como autor, quero adicionar tags ao meu post, para ele ser encontrado por área ou tema.
- **Critérios de aceite:**
  1. Dado um post em criação, quando adiciono tags e publico, então elas aparecem no post.
  2. Dado uma tag já usada, quando começo a digitar, então ela é sugerida.
  3. Número máximo de tags e formato: A definir.
- **Depende de:** HU-06, HU-07

### HU-12: Filtrar por tag
- **Origem:** RF-07
- **Prioridade:** Importante
- **História:** Como funcionário, quero filtrar por tag, para ver só os posts da minha área.
- **Critérios de aceite:**
  1. Dado um post com tag, quando clico na tag, então vejo só os posts que a têm.
  2. Dado uma tag sem posts visíveis, quando a abro, então vejo a mensagem de lista vazia.
  3. Ver RNF-02.
- **Depende de:** HU-11

## Épico 4: Destacar as melhores soluções
Mostrar o que funcionou, para o fórum ficar útil com o tempo.

### HU-13: Votar em posts e respostas
- **Origem:** RF-08
- **Prioridade:** Importante
- **História:** Como funcionário, quero votar no que foi útil, para destacar as boas soluções.
- **Critérios de aceite:**
  1. Dado um post ou resposta, quando voto, então a contagem sobe em 1.
  2. Dado que já votei, quando voto de novo no mesmo item, então a contagem não muda.
  3. Dado que votei, quando retiro meu voto, então a contagem desce em 1.
  4. Dado meu próprio conteúdo, quando tento votar: A definir.
- **Depende de:** HU-06, HU-08

### HU-14: Marcar uma resposta como aceita
- **Origem:** RF-09
- **Prioridade:** Importante
- **História:** Como autor de uma pergunta, quero marcar a resposta que resolveu, para que outros achem a solução rápido.
- **Critérios de aceite:**
  1. Dado uma pergunta minha com respostas, quando marco uma como aceita, então ela aparece destacada no topo.
  2. Dado a pergunta de outra pessoa, quando a abro, então não vejo a opção de aceitar.
  3. Dado que já aceitei uma, quando aceito outra: A definir (trocar ou permitir mais de uma).
- **Depende de:** HU-08

## Épico 5: Moderação
Manter o fórum confiável e sem conteúdo errado ou confidencial.

### HU-15: Ocultar e restaurar conteúdo
- **Origem:** RF-11
- **Prioridade:** Essencial
- **História:** Como admin, quero ocultar um conteúdo inadequado e restaurá-lo se necessário, para proteger a empresa sem perder nada por engano.
- **Critérios de aceite:**
  1. Dado um post, pergunta ou resposta, quando o admin oculta, então ele deixa de aparecer para os demais usuários.
  2. Dado um conteúdo oculto, quando o admin restaura, então ele volta a aparecer.
  3. Dado um usuário comum, quando vê um conteúdo de outro, então não vê as opções de ocultar e restaurar.
  4. Dado um conteúdo de outro, quando o admin o abre, então não consegue editar o texto.
  5. O que o autor vê do próprio conteúdo oculto: A definir.
- **Depende de:** HU-06, HU-07, HU-08 e o primeiro admin (ver Pendências)

### HU-16: Denunciar um conteúdo
- **Origem:** RF-12
- **Prioridade:** Importante
- **História:** Como funcionário, quero denunciar um conteúdo errado, ofensivo ou confidencial, para que os admins o analisem.
- **Critérios de aceite:**
  1. Dado um conteúdo, quando clico em denunciar, então ele entra na lista de denúncias dos admins.
  2. Dado que já denunciei um item, quando denuncio de novo, então vejo que já foi denunciado.
  3. Dado um usuário comum, quando acessa a lista de denúncias, então não vê essa opção.
  4. O que acontece com a denúncia depois que o admin oculta o item: A definir.
- **Depende de:** HU-15

### HU-17: Promover outro admin
- **Origem:** RF-13
- **Prioridade:** Importante
- **História:** Como admin, quero tornar outro usuário admin, para não depender de uma só pessoa.
- **Critérios de aceite:**
  1. Dado um usuário comum, quando o admin o promove, então ele passa a ver as opções de moderação.
  2. Dado um usuário comum, quando abre o fórum, então não vê a opção de promover.
  3. Dado que há admins, quando abro a lista, então vejo quem são.
- **Depende de:** HU-15

## Épico 6: Posts de times
Divulgar o que os times estão desenvolvendo, usando o mesmo formulário de post.

### HU-18: Publicar um post em nome de um time
- **Origem:** RF-03
- **Prioridade:** Importante
- **História:** Como membro de um time, quero publicar um post em nome do meu time, para que a empresa saiba o que o time desenvolve e possa colaborar.
- **Critérios de aceite:**
  1. Dado que estou criando um post, quando escolho um time na lista opcional "Publicar em nome de um time" e publico, então o post aparece identificado com o time e com meu nome.
  2. Dado nenhum time escolhido, quando publico, então o post é publicado normalmente, só com meu nome.
  3. Quem cadastra os times da lista e como um usuário se liga a um time: A definir.
- **Depende de:** HU-06

## Ordem sugerida de entrega
1. **1ª entrega (MVP):** HU-01, HU-02, HU-06, HU-07, HU-08, HU-10, HU-15.
2. **2ª entrega:** HU-09, HU-11, HU-12, HU-13, HU-14, HU-16, HU-17, HU-03, HU-04, HU-05.
3. **3ª entrega:** HU-18.
4. **Antes de abrir para todos:** seed de 10 a 15 posts e perguntas pela equipe de TI (não é história de usuário).

## Cobertura
| Requisito | Histórias |
| -- | -- |
| RF-01 | HU-01, HU-02 |
| RF-02 | HU-06 |
| RF-03 | HU-18 |
| RF-04 | HU-07 |
| RF-05 | HU-08 |
| RF-06 | HU-10 |
| RF-07 | HU-11, HU-12 |
| RF-08 | HU-13 |
| RF-09 | HU-14 |
| RF-10 | HU-09 |
| RF-11 | HU-15 |
| RF-12 | HU-16 |
| RF-13 | HU-17 |
| RF-14 | HU-03 |
| RF-15 | HU-04, HU-05 |

Requisitos sem história: nenhum.

## Pendências
- **Primeiro admin:** o PRD diz que a TI indica 2 a 3 admins, mas não como o primeiro vira admin (RF-13 só promove a partir de um admin existente). Tarefa técnica da 1ª entrega; confirmar com a TI.
- **Times (HU-18):** quem cadastra a lista de times e como o usuário se liga a um time.
- **Textos e limites A definir:** aviso de privacidade, tamanho do texto, número e formato das tags, validade do link de confirmação, texto exibido no lugar do autor de conta excluída.
- **Regras de borda A definir:** voto no próprio conteúdo, aceitar mais de uma resposta, o que o autor vê do próprio conteúdo oculto, o que acontece com a denúncia depois de ocultar o item.
- **Datas das entregas:** A definir, sem estimativas por ora.
