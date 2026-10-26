/**
 * DADOS DE EXEMPLO (fictícios). Servem só para ver as telas enquanto o backend não existe.
 * Nomes, e-mails e textos abaixo foram inventados para a demonstração.
 */
import type { ReportReason } from '../types'

export interface UserRec {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  confirmedAt: string | null
  adminSince: string | null
  deleted: boolean
}

export interface PostRec {
  id: string
  kind: 'question' | 'post'
  title: string
  body: string
  tags: string[]
  authorId: string | null
  teamId: string | null
  voters: string[]
  acceptedAnswerId: string | null
  hidden: { at: string; by: string } | null
  createdAt: string
  editedAt: string | null
}

export interface AnswerRec {
  id: string
  postId: string
  body: string
  authorId: string | null
  voters: string[]
  hidden: { at: string; by: string } | null
  createdAt: string
  editedAt: string | null
}

export interface ReportRec {
  id: string
  targetType: 'post' | 'answer'
  targetId: string
  reporterId: string
  reason: ReportReason
  details: string | null
  status: 'open' | 'actioned' | 'dismissed'
  createdAt: string
  resolvedBy: string | null
  resolvedAt: string | null
}

export interface DeletionRec {
  id: string
  userId: string | null
  status: 'pending' | 'done'
  requestedAt: string
  completedAt: string | null
}

export interface TeamRec {
  id: string
  name: string
}

export interface TagRec {
  slug: string
  name: string
}

export interface SeedData {
  /** As únicas tags dos dados de exemplo, com a caixa original dos nomes. */
  tags: TagRec[]
  users: UserRec[]
  teams: TeamRec[]
  posts: PostRec[]
  answers: AnswerRec[]
  reports: ReportRec[]
  deletions: DeletionRec[]
  privacyVersion: string
  privacyText: string
}

export const SAMPLE_USER_ID = 'u-marina'
export const SAMPLE_ADMIN_ID = 'u-helena'
export const SAMPLE_UNCONFIRMED_ID = 'u-novo'

const DAY = 24 * 60 * 60 * 1000

export function createSeed(now: number = Date.now()): SeedData {
  const ago = (days: number, hours = 0) => new Date(now - days * DAY - hours * 60 * 60 * 1000).toISOString()

  const users: UserRec[] = [
    { id: SAMPLE_USER_ID, name: 'Marina Souza', email: 'marina.souza@empresa.com.br', role: 'user', confirmedAt: ago(90), adminSince: null, deleted: false },
    { id: SAMPLE_ADMIN_ID, name: 'Helena Duarte', email: 'helena.duarte@empresa.com.br', role: 'admin', confirmedAt: ago(120), adminSince: ago(110), deleted: false },
    { id: 'u-rafael', name: 'Rafael Nunes', email: 'rafael.nunes@empresa.com.br', role: 'user', confirmedAt: ago(80), adminSince: null, deleted: false },
    { id: 'u-beatriz', name: 'Beatriz Alves', email: 'beatriz.alves@empresa.com.br', role: 'user', confirmedAt: ago(70), adminSince: null, deleted: false },
    { id: 'u-tiago', name: 'Tiago Barros', email: 'tiago.barros@empresa.com.br', role: 'user', confirmedAt: ago(60), adminSince: null, deleted: false },
    { id: 'u-paulo', name: 'Paulo Mendes', email: 'paulo.mendes@empresa.com.br', role: 'admin', confirmedAt: ago(100), adminSince: ago(95), deleted: false },
    { id: SAMPLE_UNCONFIRMED_ID, name: 'Camila Rocha', email: 'camila.rocha@empresa.com.br', role: 'user', confirmedAt: null, adminSince: null, deleted: false },
  ]

  const teams: TeamRec[] = [
    { id: 't-pagamentos', name: 'Pagamentos' },
    { id: 't-plataforma', name: 'Plataforma' },
    { id: 't-atendimento', name: 'Atendimento' },
  ]

  const posts: PostRec[] = [
    {
      id: 'p-1', kind: 'post', title: 'Novo calendário de fechamento do mês: o que muda para os times',
      body: 'Ficou definido que o fechamento do mês passa a acontecer no segundo dia útil. Os relatórios do SynchroTDF e da ETA já refletem a nova data. Confira o calendário com o seu gestor e avise se algum prazo do seu time ficou apertado.',
      tags: ['synchrotdf', 'eta'], authorId: 'u-rafael', teamId: null,
      voters: ['u-beatriz', 'u-tiago', 'u-helena'], acceptedAnswerId: null, hidden: null, createdAt: ago(2), editedAt: null,
    },
    {
      id: 'p-2', kind: 'question', title: 'Como pedir acesso ao ambiente de homologação do Corporativo?',
      body: 'Preciso testar uma mudança, mas o meu usuário não entra na homologação. Já conferi o meu perfil de acesso. Alguém sabe a quem pedir a liberação?',
      tags: ['corporativo', 'synchrodfe'], authorId: 'u-beatriz', teamId: null,
      voters: ['u-rafael'], acceptedAnswerId: 'a-1', hidden: null, createdAt: ago(6), editedAt: ago(2),
    },
    {
      id: 'p-3', kind: 'post', title: 'Guia de uso do Synchro4me para os times',
      body: 'O time de Pagamentos publicou um guia curto com os primeiros passos do Synchro4me e as dúvidas mais comuns. Está aberto para todos os times. Quem quiser sugerir tópicos pode falar com a gente.',
      tags: ['synchro4me', 'ia'], authorId: 'u-tiago', teamId: 't-pagamentos',
      voters: ['u-marina', 'u-beatriz', 'u-rafael', 'u-helena'], acceptedAnswerId: null, hidden: null, createdAt: ago(3), editedAt: null,
    },
    {
      id: 'p-4', kind: 'question', title: 'Como a IA deve tratar dados de clientes nos nossos testes?',
      body: 'Estamos avaliando usar IA para apoiar a análise de chamados. Qual é a regra para dados de clientes em exemplos e testes? Posso colar um texto real para a ferramenta resumir?',
      tags: ['ia'], authorId: 'u-marina', teamId: null,
      voters: [], acceptedAnswerId: null, hidden: null, createdAt: ago(1), editedAt: null,
    },
    {
      id: 'p-5', kind: 'post', title: 'Dicas para a importação de arquivos grandes na ETA',
      body: 'Depois de algumas tentativas, o que funcionou aqui: dividir o arquivo em partes menores por período, importar uma parte por vez e conferir o total no SynchroDFE no fim. Assim nenhuma linha fica de fora e o erro de tempo esgotado some.',
      tags: ['eta', 'synchrodfe'], authorId: 'u-marina', teamId: null,
      voters: ['u-rafael', 'u-tiago'], acceptedAnswerId: null, hidden: null, createdAt: ago(9), editedAt: null,
    },
    {
      id: 'p-6', kind: 'question', title: 'Quando devo usar o SynchroDFE e quando devo usar o SynchroTDF?',
      body: 'Não está claro para mim qual dos dois usar na conferência do mês. Existe algum critério, ou depende do cliente?',
      tags: ['synchrodfe', 'synchrotdf'], authorId: 'u-tiago', teamId: null,
      voters: ['u-marina'], acceptedAnswerId: null, hidden: null, createdAt: ago(12), editedAt: null,
    },
    {
      id: 'p-7', kind: 'post', title: 'Aviso de certificado ao abrir o Corporativo: como resolver',
      body: 'Se aparecer um aviso de certificado inválido ao abrir o Corporativo, confira primeiro a data e a hora do computador. Com o relógio errado o navegador recusa o certificado. Ajuste para o horário automático e abra de novo.',
      tags: ['corporativo'], authorId: 'u-beatriz', teamId: null,
      voters: ['u-rafael', 'u-marina', 'u-tiago', 'u-helena', 'u-paulo'], acceptedAnswerId: null, hidden: null, createdAt: ago(15), editedAt: null,
    },
    {
      id: 'p-8', kind: 'post', title: 'Nova versão da integração entre o SynchroTDF e a ETA',
      body: 'A Plataforma liberou a nova versão da integração entre o SynchroTDF e a ETA, com menos etapas manuais. O guia de migração está no repositório do time.',
      tags: ['synchrotdf', 'eta'], authorId: 'u-rafael', teamId: 't-plataforma',
      voters: ['u-beatriz'], acceptedAnswerId: null, hidden: null, createdAt: ago(18), editedAt: null,
    },
    {
      id: 'p-9', kind: 'question', title: 'Como usar a IA para resumir chamados do Synchro4me?',
      body: 'Alguém já testou? Quero resumir o histórico de um chamado antes de passar o caso para outro time, sem perder os detalhes importantes.',
      tags: ['ia', 'synchro4me'], authorId: 'u-tiago', teamId: null,
      voters: [], acceptedAnswerId: null, hidden: null, createdAt: ago(20), editedAt: null,
    },
    {
      id: 'p-10', kind: 'post', title: 'Senha de acesso colada no texto de um post',
      body: 'Texto de exemplo com um conteúdo que foi denunciado como confidencial e ocultado pelos administradores, para a demonstração da moderação.',
      tags: ['corporativo'], authorId: 'u-rafael', teamId: null,
      voters: [], acceptedAnswerId: null, hidden: { at: ago(4), by: SAMPLE_ADMIN_ID }, createdAt: ago(5), editedAt: null,
    },
    {
      id: 'p-11', kind: 'post', title: 'Dica de exemplo que a Marina escreveu e os administradores ocultaram',
      body: 'Texto de exemplo para ver a faixa que o autor enxerga em conteúdo oculto.',
      tags: ['eta'], authorId: SAMPLE_USER_ID, teamId: null,
      voters: [], acceptedAnswerId: null, hidden: { at: ago(7), by: SAMPLE_ADMIN_ID }, createdAt: ago(8), editedAt: null,
    },
    {
      id: 'p-12', kind: 'question', title: 'Pergunta de uma pessoa que já saiu da empresa',
      body: 'Exemplo de pergunta cuja autora teve a conta excluída. O texto continua no fórum, sem o nome, e fala do SynchroDFE.',
      tags: ['synchrodfe'], authorId: null, teamId: null,
      voters: [], acceptedAnswerId: null, hidden: null, createdAt: ago(25), editedAt: null,
    },
  ]

  const answers: AnswerRec[] = [
    { id: 'a-1', postId: 'p-2', body: 'Na homologação a liberação é feita pelo time de Infraestrutura. Abra um chamado informando o seu perfil e o ambiente; costuma sair no mesmo dia.', authorId: 'u-rafael', voters: ['u-beatriz', 'u-tiago'], hidden: null, createdAt: ago(5), editedAt: null },
    { id: 'a-2', postId: 'p-2', body: 'Confira também se o seu usuário já foi sincronizado com o Synchro4me. Já me confundi com isso.', authorId: 'u-tiago', voters: ['u-beatriz'], hidden: null, createdAt: ago(5, 3), editedAt: null },
    { id: 'a-3', postId: 'p-2', body: 'Resposta de exemplo ocultada pelos administradores.', authorId: 'u-paulo', voters: [], hidden: { at: ago(3), by: SAMPLE_ADMIN_ID }, createdAt: ago(4), editedAt: null },
    { id: 'a-4', postId: 'p-6', body: 'Depende do tipo de documento do cliente. Veja o guia do time e, na dúvida, pergunte ao time responsável antes de importar.', authorId: 'u-rafael', voters: ['u-tiago', 'u-marina', 'u-beatriz'], hidden: null, createdAt: ago(11), editedAt: null },
    { id: 'a-5', postId: 'p-6', body: 'No meu time usamos o SynchroDFE para a conferência e o SynchroTDF só para consulta. Vale combinar com o seu gestor.', authorId: 'u-beatriz', voters: [], hidden: null, createdAt: ago(10), editedAt: null },
    { id: 'a-6', postId: 'p-4', body: 'Não use dados reais. Troque nomes e documentos por exemplos fictícios antes de enviar qualquer texto para a ferramenta.', authorId: 'u-rafael', voters: [], hidden: null, createdAt: ago(0, 5), editedAt: null },
  ]

  const reports: ReportRec[] = [
    { id: 'r-1', targetType: 'post', targetId: 'p-1', reporterId: 'u-beatriz', reason: 'incorrect', details: 'A data de fechamento citada já mudou.', status: 'open', createdAt: ago(1), resolvedBy: null, resolvedAt: null },
    { id: 'r-2', targetType: 'answer', targetId: 'a-2', reporterId: 'u-tiago', reason: 'offensive', details: null, status: 'open', createdAt: ago(0, 6), resolvedBy: null, resolvedAt: null },
    { id: 'r-3', targetType: 'post', targetId: 'p-10', reporterId: 'u-marina', reason: 'confidential', details: 'Parece conter uma senha.', status: 'actioned', createdAt: ago(5), resolvedBy: SAMPLE_ADMIN_ID, resolvedAt: ago(4) },
    { id: 'r-4', targetType: 'post', targetId: 'p-8', reporterId: 'u-tiago', reason: 'other', details: null, status: 'dismissed', createdAt: ago(10), resolvedBy: 'u-paulo', resolvedAt: ago(9) },
  ]

  const deletions: DeletionRec[] = [
    { id: 'd-1', userId: 'u-tiago', status: 'pending', requestedAt: ago(2), completedAt: null },
    { id: 'd-2', userId: null, status: 'done', requestedAt: ago(30), completedAt: ago(28) },
  ]

  return {
    users, teams, posts, answers, reports, deletions,
    tags: [
      { slug: 'ia', name: 'IA' },
      { slug: 'synchro4me', name: 'Synchro4me' },
      { slug: 'synchrotdf', name: 'SynchroTDF' },
      { slug: 'eta', name: 'ETA' },
      { slug: 'corporativo', name: 'Corporativo' },
      { slug: 'synchrodfe', name: 'SynchroDFE' },
    ],
    privacyVersion: '2026-10-exemplo',
    privacyText:
      'Guardamos só o seu nome e o seu e-mail. O seu nome aparece nas coisas que você publica. O seu e-mail é visto apenas pelos administradores do fórum. Você pode pedir a exclusão da conta quando quiser; o que você publicou continua no fórum, sem o seu nome.',
  }
}
