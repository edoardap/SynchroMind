# PRD: Fórum interno de conhecimento

| Campo | Valor |
| -- | -- |
| Responsável | Equipe Synpower |
| Status | Rascunho |
| Data | 2026-10-26 |

## 1. Visão geral
Fórum interno em que funcionários de uma empresa de 50 a 500 pessoas publicam soluções de problemas, fazem perguntas e divulgam o que seus times estão desenvolvendo, para reduzir as "ilhas de conhecimento". O desenvolvimento é feito pela equipe de TI da própria empresa.

## 2. Problema e oportunidade
Pessoas e times resolvem problemas isoladamente. Outros times enfrentam problemas parecidos sem saber que já existe solução, e há retrabalho. Hoje o conhecimento circula por chat, wiki, reuniões e boca a boca, e na prática quase nada é compartilhado de forma estabelecida. A dor foi vista e relatada pelo responsável, que tem dados (a detalhar). Fonte: `docs/discovery/forum-conhecimento.md`.

## 3. Objetivos e não objetivos
**Objetivos**
- Tornar soluções já existentes encontráveis por qualquer pessoa da empresa.
- Dar um lugar para os times divulgarem o que desenvolvem.

**Não objetivos (MVP)**
- Integração com chat e wiki.
- App de celular.
- Mensagens diretas entre usuários.
- Posts anônimos.
- Anexos de arquivo.

## 4. Usuários
- **Principal:** funcionário que resolveu um problema e pode registrá-lo, ou que tem um problema e procura a solução. Frequência de uso: A definir.
- **Secundário:** times que publicam sobre o que desenvolvem (posts estilo InfoQ).
- **Administrador da plataforma:** de 2 a 3 admins no início, indicados pela equipe de TI; um admin pode promover outro. Moderam o conteúdo do fórum como um todo.
- Perfil por área (dev, operações, suporte etc.): premissa, a confirmar.

## 5. Métricas de sucesso
As metas serão definidas depois de 4 semanas de uso real, com base no que for medido.

| Métrica | Valor atual | Meta | Como medir |
| -- | -- | -- | -- |
| Problemas repetidos entre times (resultado) | A definir (dados do responsável) | A definir após 4 semanas | Análise dos dados existentes |
| Perguntas respondidas com solução aceita (resultado) | n/a | A definir após 4 semanas | Proporção de perguntas com resposta aceita |
| Posts publicados por semana (atividade) | 0 | A definir após 4 semanas | Contagem no próprio fórum |
| % de usuários cadastrados que publicaram ou responderam (atividade) | 0 | A definir após 4 semanas | Contagem no próprio fórum |

## 6. Escopo
- **Dentro (MVP):** cadastro com e-mail da empresa; posts sobre qualquer tema da empresa, com opção de publicar em nome de um time; perguntas e respostas; busca; tags; votos; resposta aceita; edição do próprio conteúdo; moderação por admins (ocultar, restaurar, denúncia); carga inicial de conteúdo (seed) pela equipe de TI.
- **Fora:** ver não objetivos.

## 7. Fluxos do usuário
1. **Entrar:** cria conta com e-mail da empresa, confirma o e-mail por link e acessa o fórum.
2. **Criar um post:** clica em "Criar um post", escreve título e texto sobre qualquer tema da empresa, adiciona tags e publica.
3. **Perguntar:** publica uma pergunta; outros respondem; o autor marca a resposta que resolveu.
4. **Buscar:** busca por palavra-chave ou tag, abre o post e vota se foi útil.
5. **Divulgar trabalho do time:** ao criar um post, escolhe o time na lista opcional "Publicar em nome de um time" e publica.
6. **Denunciar:** clica em "denunciar" num conteúdo errado, ofensivo ou confidencial; os admins são avisados e podem ocultá-lo.

## 8. Requisitos funcionais
| ID | Requisito | Prioridade | Critério de aceite | Origem |
| -- | -- | -- | -- | -- |
| RF-01 | O sistema permite que o funcionário crie conta com o e-mail da empresa e confirme o e-mail por link para acessar o fórum | Essencial | Com e-mail do domínio da empresa a conta é criada e só libera o acesso após clicar no link de confirmação; com outro domínio o cadastro é recusado com mensagem | Decisão de acesso |
| RF-02 | O sistema permite que o usuário publique um post sobre qualquer tema da empresa, com título, texto e tags | Essencial | O usuário preenche título e texto, publica e o post aparece na lista; com título ou texto vazios, o post não é publicado e o campo faltante é indicado | Problema (soluções não compartilhadas) e decisão do responsável: o post pode ser sobre qualquer tema |
| RF-03 | O sistema permite que o usuário, ao criar um post, escolha opcionalmente publicar em nome de um time, escolhendo o time numa lista | Importante | O usuário escolhe um time e publica, e o post aparece identificado com o time e com o autor; sem time escolhido, o post é publicado só com o autor | Pedido do responsável (estilo InfoQ) |
| RF-04 | O sistema permite que o usuário publique uma pergunta | Essencial | A pergunta aparece na lista e aceita respostas | MVP confirmado |
| RF-05 | O sistema permite que o usuário responda a uma pergunta | Essencial | A resposta aparece abaixo da pergunta | MVP confirmado |
| RF-06 | O sistema permite buscar posts por palavra-chave | Essencial | Ao buscar um termo presente num post ou no texto de uma resposta, o post aparece nos resultados | Problema (encontrar soluções existentes) |
| RF-07 | O sistema permite associar tags a um post e filtrar por tag | Importante | O usuário adiciona tags ao publicar e ao clicar numa tag vê só os posts com ela | MVP confirmado |
| RF-08 | O sistema permite que o usuário vote num post ou resposta | Importante | O voto altera a contagem exibida, um voto por usuário por item | MVP confirmado |
| RF-09 | O sistema permite que o autor da pergunta marque uma resposta como aceita | Importante | A resposta aceita aparece destacada, no topo | MVP confirmado |
| RF-10 | O sistema permite que o usuário edite o próprio conteúdo | Importante | O autor edita seu post/resposta e a alteração aparece; outros usuários não veem opção de editar | Decisão de moderação |
| RF-11 | O sistema permite que um administrador oculte qualquer post, pergunta ou resposta e depois o restaure | Essencial | O admin oculta o item e ele deixa de aparecer para os demais usuários; o admin restaura e ele volta a aparecer; usuário comum não vê essas opções; o admin não edita o texto de outros | Decisão de moderação (admins da plataforma) |
| RF-12 | O sistema permite que o usuário denuncie um conteúdo | Importante | Ao denunciar, os admins veem o item numa lista de denúncias | Decisão de moderação |
| RF-13 | O sistema permite que um admin promova outro usuário a admin | Importante | O admin torna um usuário admin e ele passa a ver as opções de RF-11; usuário comum não vê essa opção | Decisão de moderação |
| RF-14 | O sistema mostra, no cadastro, um aviso curto sobre quais dados são usados e por quem | Importante | Na tela de cadastro o usuário vê o aviso e só conclui o cadastro depois de reconhecê-lo | Privacidade (sem jurídico na empresa) |
| RF-15 | O sistema permite que o usuário peça a exclusão da conta, tratada pelos admins | Importante | O usuário envia o pedido e os admins o veem numa lista; após a exclusão pelo admin, o usuário não consegue mais entrar, seus dados pessoais (nome e e-mail) são removidos e os posts, perguntas e respostas que ele publicou continuam visíveis, sem identificação do autor | Privacidade (sem jurídico na empresa) |

## 9. Requisitos não funcionais
| ID | Requisito | Limite ou meta |
| -- | -- | -- |
| RNF-01 | Acesso restrito a quem tem e-mail da empresa confirmado | Nenhum acesso a conteúdo sem conta válida |
| RNF-02 | Desempenho da busca | Resultados em até 2 segundos para pelo menos 95% das buscas (confirmado). A busca encontra o termo no título, no texto e nas tags, ignora acentos e maiúsculas e ordena por relevância e, em empate, por votos |
| RNF-03 | Disponibilidade | Horário comercial (sugestão, a confirmar) |
| RNF-04 | Privacidade e LGPD | Guardar só nome e e-mail (sugestão). A empresa não tem jurídico nem DPO, então não há validação formal; o responsável pelos dados pessoais é a empresa como um todo, sem pessoa nomeada |
| RNF-05 | Idioma da interface | Português do Brasil (sugestão, a confirmar) |
| RNF-06 | Acessibilidade e compatibilidade (navegadores, celular) | Funciona nas versões atuais de Chrome, Edge, Firefox e Safari; layout responsivo, usável em telas de 360 px ou mais, sem app nativo; navegação por teclado, contraste legível e texto alternativo em imagens (confirmado) |

## 10. Dependências e restrições
- Desenvolvimento pela equipe de TI da própria empresa, que também fornece o domínio de e-mail para o cadastro.
- Stack já definida: Python, FastAPI e PostgreSQL (frontend a confirmar).
- A empresa usa o webmail Zimbra, sem login único Google ou Microsoft; o envio de e-mails usa o servidor de e-mail da empresa. O domínio informado foi `synchro_geral.com`, que precisa ser confirmado (domínios não aceitam underscore).
- A empresa não tem departamento jurídico nem DPO: nenhuma validação formal de LGPD está disponível.

## 11. Riscos e mitigação
| Risco | Impacto | Mitigação |
| -- | -- | -- |
| Fórum vazio no lançamento, ninguém contribui (H-03, não validada) | Alto | Carga inicial de 10 a 15 posts e perguntas-base pela equipe de TI antes de abrir para todos; publicar é simples |
| Ninguém busca no fórum antes de perguntar a um colega (H-04, não validada) | Alto | Divulgação interna; medir buscas e leituras |
| A causa de a wiki/chat atuais falharem é desconhecida (H-02, não validada) | Alto | Observar o uso após o lançamento; ajustar |
| Sem patrocinador de gestão, ninguém libera tempo para contribuir (H-05) | Médio | Medir a adesão nas 4 primeiras semanas e buscar apoio de gestão se for baixa |
| Ao excluir uma conta, o conteúdo continua e o texto pode conter dados pessoais do autor (RF-15) | Baixo | Avisar o usuário, ao pedir a exclusão, de que o conteúdo permanece sem seu nome; admins podem ocultar casos específicos (RF-11) |
| Conteúdo errado, desatualizado ou confidencial permanece | Médio | Admins ocultam o conteúdo (RF-11) e usuários denunciam (RF-12); moderação entra na primeira entrega |

## 12. Marcos
1. **1ª entrega:** RF-01, 02, 04, 05, 06 e 11.
2. **2ª entrega:** RF-07, 08, 09, 10, 12, 13, 14 e 15.
3. **3ª entrega:** RF-03 (posts de time).
4. **Antes de abrir para todos:** carga inicial de conteúdo (seed) pela equipe de TI.
5. **4 semanas após o lançamento:** definir as metas de sucesso.

Datas: A definir.

## 13. Partes interessadas
- Responsável pelo produto: equipe Synpower.
- Desenvolvimento: equipe de TI da empresa.
- Patrocinador de gestão: não há por ora.
- Times piloto: nenhum definido; o fórum abre para todos após o seed.

## 14. Premissas
- O problema existe e é recorrente (visto, relatado e com dados do responsável).
- Pessoas escreverão e buscarão no fórum (H-03, H-04).
- Os problemas se repetem entre times, não só dentro de um time.
- Mesmo sem patrocinador, as pessoas terão tempo para contribuir (H-05).
- O responsável decidiu seguir sem entrevistas nem piloto de validação.

## 15. Perguntas em aberto
| Pergunta | Bloqueia |
| -- | -- |
| Quais dados existem hoje e qual o tamanho do problema (contagem aproximada de casos repetidos)? | Métricas (valor atual) |
| Datas das entregas | Marcos |
