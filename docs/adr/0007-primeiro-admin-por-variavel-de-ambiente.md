# ADR-0007: Definir os primeiros admins por variável de ambiente e comando de linha

- **Status:** Proposto
- **Data:** 2026-10-26
- **Decisores:** Equipe Synpower (a confirmar com a TI)

## Contexto
O PRD diz que a TI indica de 2 a 3 admins no início e que um admin promove outro (RF-13), mas não diz como o primeiro vira admin. O planejamento lista isso como tarefa técnica da 1ª entrega e como dependência de HU-15.

## Decisão
Uma variável de ambiente `BOOTSTRAP_ADMIN_EMAILS` (lista de e-mails) define os admins iniciais: quando uma conta com um desses e-mails confirma o e-mail pela primeira vez, ela recebe o papel `admin`. Como a confirmação prova a posse da caixa, o e-mail na lista não vira porta de entrada para terceiros. Um comando `app.cli promote-admin <email>` serve de recuperação (por exemplo, se todos os admins saírem), e grava a ação no log de auditoria. Remover um e-mail da variável não rebaixa ninguém.

## Alternativas consideradas
- **Primeiro usuário cadastrado vira admin:** qualquer pessoa pode chegar primeiro. Descartada.
- **SQL manual feito pela TI:** funciona, mas é frágil, sem registro e fácil de esquecer em ambiente novo. Descartada como caminho principal.
- **Migração de banco que insere o admin:** coloca dados de pessoas no repositório e no histórico de versões. Descartada.

## Consequências
- **Positivas:** sem passo manual fora do código; funciona igual em desenvolvimento, homologação e produção; o primeiro admin existe antes do seed e da abertura geral.
- **Negativas / custos:** quem altera a variável de ambiente do servidor tem poder equivalente a criar admin (já é o caso de quem tem acesso ao banco).
- **Riscos e gatilho de revisão:** não existe rebaixar admin na API (RF-13 só pede promover); revisar se for necessário remover privilégio sem apagar a conta.

## Questões em aberto
- Quem são os 2 ou 3 admins iniciais (TI)?
- Rebaixar admin entra no escopo?

## Relacionados
- RF-13, HU-15, HU-17; planejamento, pendência "Primeiro admin".
