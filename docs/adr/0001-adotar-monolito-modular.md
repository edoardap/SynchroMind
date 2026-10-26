# ADR-0001: Adotar um monolito modular com um banco relacional

- **Status:** Proposto
- **Data:** 2026-10-26
- **Decisores:** Equipe Synpower (a confirmar)

## Contexto
Fórum interno para uma empresa de 50 a 500 pessoas, mantido pela equipe de TI da própria empresa (PRD, seções 1 e 10). Uso restrito a funcionários (RNF-01), disponibilidade em horário comercial (RNF-03, sugestão) e busca em até 2 s para 95% das buscas (RNF-02). Não há carga, volume de conteúdo nem tamanho de time informados; o PRD só fala em "poucas centenas de usuários". Não existe integração externa além de e-mail.

## Decisão
Construir uma única aplicação implantável (API HTTP), organizada em módulos com fronteiras explícitas (acesso, conteúdo, busca, moderação, times, e-mail), mais um processo de worker da mesma base de código, com um único PostgreSQL como armazenamento.

## Alternativas consideradas
- **Microsserviços:** isolam falha e escala por serviço, mas nenhum requisito pede isso, e custam rede, deploy e observabilidade múltiplos para um time pequeno. Descartada.
- **Monolito sem fronteiras (camadas por tipo de arquivo):** é o mais rápido de começar, mas mistura moderação, busca e conteúdo e dificulta evoluir. Descartada pelo custo baixo de separar por módulo desde o início.
- **Serverless (funções + banco gerenciado):** reduz operação, mas depende de plataforma de nuvem que ninguém informou, e a busca e o worker de e-mail ficam menos simples. Descartada por falta de premissa de nuvem.

## Consequências
- **Positivas:** um deploy, uma transação cobre uma regra inteira (ex.: ocultar item e encerrar denúncias), operação simples para a TI.
- **Negativas / custos:** escala só vertical e em bloco; um defeito grave derruba tudo. Aceitável pelo RNF-03.
- **Riscos e gatilho de revisão:** reabrir se a busca competir por recursos com o restante (extrair a busca) ou se surgir um segundo time dono de parte do sistema.

## Questões em aberto
- Onde a TI hospeda (VM, contêiner, nuvem)? Não informado.

## Relacionados
- docs/arquitetura/forum-conhecimento.md; ADR-0002, ADR-0004, ADR-0006.
