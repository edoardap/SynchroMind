# ADR-0006: Enviar e-mails por outbox no banco, com worker e SMTP

- **Status:** Proposto
- **Data:** 2026-10-26
- **Decisores:** Equipe Synpower (a confirmar); TI para o relay de e-mail

## Contexto
O sistema precisa enviar e-mail de confirmação e de login (RF-01, HU-02) e avisar admins de denúncias e pedidos de exclusão (fluxo 6 do PRD, RF-12, RF-15). A TI da empresa fornece o domínio de e-mail (PRD, seção 10). A empresa usa o webmail Zimbra (resposta do usuário), então o envio deve usar o SMTP desse servidor; endereço, porta, credencial e remetente ainda precisam ser confirmados com a TI. O usuário pediu o padrão `synchro_geral.com` para o domínio; domínios não aceitam underscore, então o domínio real precisa ser confirmado.

## Decisão
A aplicação grava a mensagem numa tabela `email_outbox` na mesma transação que cria a conta ou a denúncia. Um processo worker (mesma base de código, comando separado) lê as mensagens pendentes com `FOR UPDATE SKIP LOCKED`, envia por SMTP configurado por variáveis de ambiente e tenta de novo com espera crescente. Depois do envio, o conteúdo e o endereço são apagados da linha (ela guarda só estado e data). O endereço do remetente e as credenciais SMTP vêm de variáveis de ambiente ou do cofre da TI, nunca do repositório nem de logs. Em desenvolvimento, o SMTP aponta para um coletor local.

## Alternativas consideradas
- **Enviar direto na requisição:** o mais simples, mas se o SMTP falha ou demora o cadastro falha ou trava, e não há nova tentativa. Descartada.
- **Fila externa (Redis, RabbitMQ) com Celery ou similar:** resolve, mas é infraestrutura nova para algumas dezenas de e-mails por dia. Descartada.
- **API de provedor (SES, SendGrid, Graph API):** também funciona atrás da mesma interface; a escolha do canal fica a cargo da TI. O desenho isola isso num adaptador `EmailSender`.

## Consequências
- **Positivas:** nenhum e-mail se perde se o SMTP estiver fora; o cadastro responde rápido; trocar o canal é trocar um adaptador.
- **Negativas / custos:** um processo a mais para operar (monitorar fila pendente); a linha do outbox contém o link com o token até o envio, então precisa ser apagada e o acesso ao banco, restrito.
- **Riscos e gatilho de revisão:** deliverability (SPF, DKIM, DMARC do remetente) é responsabilidade da TI. Reabrir se o volume crescer ao ponto de precisar de fila dedicada.

## Questões em aberto
- Qual relay ou serviço de e-mail a TI vai usar, e qual endereço de remetente?
- Admins recebem e-mail a cada denúncia, ou um resumo? Padrão adotado: um e-mail por evento.

## Relacionados
- ADR-0003; RF-01, RF-12, RF-15; HU-02.
