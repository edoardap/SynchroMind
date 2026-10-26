# ADR-0002: Usar Python/FastAPI, PostgreSQL e uma SPA React com TypeScript

- **Status:** Aceito para backend e banco (Python, FastAPI, PostgreSQL, confirmado pelo usuário); frontend React com TypeScript segue Proposto
- **Data:** 2026-10-26
- **Decisores:** Equipe Synpower

## Contexto
A stack não foi definida no PRD. O que existe: interface em português do Brasil (RNF-05), navegadores atuais e telas a partir de 360 px (RNF-06), sem app nativo, e a API REST pedida para cobrir as histórias HU-01 a HU-18. O conhecimento técnico do time de TI não foi informado. O único arquivo de código do diretório (`main.py`) é um exemplo gerado pelo PyCharm, o que é indício fraco de familiaridade com Python, e não prova.

## Decisão
Backend em Python com FastAPI (SQLAlchemy 2 e Alembic para o banco), PostgreSQL como banco, e frontend como SPA em React com TypeScript servida pelo mesmo domínio da API. A decisão só vale se o time de TI mantiver Python e React com conforto; caso contrário, vale a alternativa de maior fit com o time (o contrato da API não muda).

## Alternativas consideradas
- **Django com templates (HTML renderizado no servidor):** é a opção mais simples de operar (um app, painel admin e autenticação prontos, sem build de frontend). Perde por não entregar a API REST pedida e por deixar a interface acoplada. É a melhor escolha se o time conhecer Django e dispensar a SPA; é a alternativa mais forte a esta decisão.
- **Node/TypeScript no backend e no frontend:** uma só linguagem. Equivalente em custo; escolher se o time já for de TypeScript.
- **.NET ou Java:** viáveis, mas sem nenhum indício de que a TI as use; custo de partida maior para um sistema deste tamanho.
- **Banco NoSQL (documentos):** o domínio é relacional (votos únicos por usuário, resposta aceita, denúncias) e precisa de integridade; descartado.

## Consequências
- **Positivas:** FastAPI gera o contrato OpenAPI a partir do código, e a SPA pode usar um cliente gerado; PostgreSQL concentra busca, sessões e fila de e-mail (ADR-0004, ADR-0006).
- **Negativas / custos:** dois artefatos a construir (API e SPA) e um passo de build do frontend; a SPA precisa de cuidado com acessibilidade (RNF-06) e com XSS no conteúdo.
- **Riscos e gatilho de revisão:** reabrir antes de começar o código se o time não tiver Python ou React. Depois do início, o custo de troca é alto.

## Questões em aberto
- Respondido: Python, FastAPI e PostgreSQL. Falta confirmar o frontend (React com TypeScript, ou outra opção) antes do primeiro commit de interface.
- Versões exatas das bibliotecas: não verificadas; fixar ao iniciar o projeto.

## Relacionados
- ADR-0001; docs/arquitetura/forum-conhecimento.md; RNF-05, RNF-06.
