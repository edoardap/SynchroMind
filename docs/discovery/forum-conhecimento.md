# Descoberta: Fórum interno de conhecimento

## Resumo
Em uma empresa de 50 a 500 pessoas, times resolvem problemas que outros já resolveram, e o conhecimento fica preso em quem o produziu. O problema parece real, mas o risco maior não é a falta de ferramenta. É saber se as pessoas escreveriam e buscariam num fórum, já que wiki e chat existem e, pelo relato, não resolvem. **Recomendação: Testar mais**, com testes baratos de uma ou duas semanas antes de especificar.

## Problema
Pessoas e times resolvem problemas isoladamente ("ilhas de conhecimento"). Outros times enfrentam problemas parecidos sem saber que já existe solução, gerando retrabalho. Frequência e custo: a definir (dependem dos dados que o autor possui).

## Usuários e contexto
Funcionários de uma empresa de 50 a 500 pessoas, com vários times e áreas. Hoje o conhecimento circula por chat (Slack/Teams), wiki (Confluence/Notion), reuniões e boca a boca; na prática, quase nada é compartilhado de forma estabelecida. Alternativa atual inclui "não fazer nada" e perguntar a quem se conhece.

## O que já sabemos
| Afirmação | Tipo (Evidência / Relato / Suposição) | Fonte |
| -- | -- | -- |
| Existem ilhas de conhecimento na empresa | Evidência + Relato | Autor viu acontecer, colegas contaram e há dados |
| Compartilhar hoje é quase inexistente, ou via chat, boca a boca ou wiki | Evidência | Autor |
| A wiki/Confluence/Notion existe, mas não resolve | Relato | Autor. Falta saber por quê (desatualizada? ninguém acha? ninguém escreve?) |
| Os dados existentes mostram o quê, com que tamanho? | A definir | Autor |
| Pessoas escreveriam e compartilhariam soluções | Suposição | Ninguém verificou |
| Quem tem o problema buscaria no fórum antes de perguntar a alguém | Suposição | Ninguém verificou |
| A liderança apoia e dá tempo para isso | Suposição | Ninguém verificou |

## Hipóteses
Os limites são sugestões, a ajustar pelo autor.

| ID | Hipótese | Risco | Sinal que confirma | Sinal que refuta |
| -- | -- | -- | -- | -- |
| H-01 | Acreditamos que pessoas de times diferentes refazem trabalho que já foi resolvido. Saberemos que é verdade se citarem casos concretos recentes. | Alto (evidência parcial) | Maioria dos entrevistados (sugestão: 5 de 8) cita um caso nos últimos 3 meses | Poucos citam caso, ou só dentro do mesmo time |
| H-02 | Acreditamos que a wiki e o chat atuais falham por uma causa específica. Saberemos que é verdade se a causa se repetir nas entrevistas. | Alto, sem evidência | Uma causa dominante aparece (ex.: "não acho", "está velho") | Respostas dispersas, ou "nem sabia que existia" (aí o problema é divulgação) |
| H-03 | Acreditamos que quem resolve um problema estaria disposto a registrá-lo. Saberemos que é verdade se já fizeram algo parecido e se aceitam um piloto. | Alto, sem evidência | Parte relevante já registrou algo ou aceita um piloto de 2 semanas | Dizem que "não tem tempo" sem ter tentado nada parecido |
| H-04 | Acreditamos que quem tem um problema buscaria no fórum antes de perguntar a alguém. Saberemos que é verdade se hoje já buscam antes de perguntar. | Médio | Relatam que pesquisam antes de perguntar | Perguntam direto ao colega por hábito ou por confiança |
| H-05 | Acreditamos que gestores liberariam tempo para isso. Saberemos que é verdade se ao menos um gestor se comprometer com o piloto. | Médio | Gestores topam participar | Veem como "trabalho extra" |

## Plano de validação
| Hipótese | Método | Quem/quantos | Prazo | Resultado esperado |
| -- | -- | -- | -- | -- |
| H-01, H-02 | Entrevistas sobre o passado | 6 a 8 pessoas de 3+ times (sugestão) | 1 semana | Casos concretos + causa da falha |
| H-01 | Analisar os dados atuais do autor | Autor | 2 dias | Quantifica a recorrência |
| H-03, H-04 | Piloto manual: canal ou página simples com 10 a 15 problemas já resolvidos, escritos pelo autor ou voluntários | 1 ou 2 times | 2 semanas | Há leitura, busca e novas contribuições espontâneas? |
| H-05 | Conversa com gestores | 2 a 3 gestores | 1 semana | Apoio ou resistência |

## Roteiro de entrevista
1. Conte o último problema técnico/operacional que você precisou resolver. Como começou?
2. Onde você procurou a resposta? Quanto tempo levou?
3. Depois, descobriu que alguém já tinha resolvido aquilo? Como soube?
4. Quando foi a última vez que você documentou ou explicou uma solução para outra pessoa? Onde, e por quê?
5. O que você já tentou na wiki/chat? O que aconteceu?
6. O que impediu você de registrar a solução da última vez que não registrou?

## Recomendação
**Testar mais.** O problema tem boa base (visto, ouvido e com dados), mas as decisões que derrubam o produto (escrever, buscar e por que o que existe falha) não têm evidência. Construir um site agora arriscaria um fórum vazio.

O que mudaria a decisão:
- **Seguir/Ajustar:** H-02 e H-03 confirmadas, ou o piloto gerando contribuição espontânea.
- **Ajustar para outra coisa:** se a causa for "a wiki existe e ninguém acha", a solução pode ser busca ou curadoria, não um fórum novo.
- **Parar:** se ninguém contribuir nem no piloto.

## Perguntas em aberto
- Que dados existem hoje (tickets, perguntas repetidas, tempo perdido)?
- Em qual área o problema aparece mais: dev, operações, suporte, outra?
- Quem patrocina a iniciativa: o autor, um gestor, a empresa?
- Há prazo ou motivo para agora?

## Resumo para o PRD
Não aplicável por ora: a recomendação é Testar mais.
