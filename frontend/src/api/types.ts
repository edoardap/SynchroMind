/**
 * Tipos do contrato da API (docs/arquitetura/forum-conhecimento.md, seção 5), em /api/v1.
 * Nomes de campo em inglês, como no contrato; textos de interface ficam nas telas.
 */

export type Role = 'user' | 'admin'
/**
 * Tipo do conteúdo. Decisão do usuário (2026-10-26): o tipo "problema e solução" foi unificado em "post" (texto livre,
 * sobre qualquer tema da empresa), e o post em nome de um time deixou de ser um tipo: é um "post" com `team`.
 * docs/arquitetura/forum-conhecimento.md (seções 4, 5.2 e 5.3) já está alinhado a isto.
 */
export type PostKind = 'question' | 'post'
export type ContentStatus = 'visible' | 'hidden'

export interface Author {
  id: string
  name: string
}

export interface Tag {
  slug: string
  name: string
}

export interface Team {
  id: string
  name: string
}

/** GET /me. O e-mail só aparece para o próprio usuário e em /admin/*. */
export interface Me {
  id: string
  name: string
  email: string
  role: Role
  /** null enquanto o e-mail não foi confirmado (RNF-01). */
  email_confirmed_at: string | null
  teams: Team[]
}

export interface PrivacyNotice {
  version: string
  text: string
}

export interface PostPermissions {
  can_edit: boolean
  can_accept: boolean
  can_hide: boolean
  can_report: boolean
}

export interface HiddenInfo {
  at: string
  /** Só para admin (hidden_at e hidden_by não vão a usuário comum). */
  by: Author | null
}

export interface PostSummary {
  id: string
  kind: PostKind
  title: string
  excerpt: string
  tags: Tag[]
  author: Author | null
  team: Team | null
  vote_count: number
  answer_count: number
  accepted_answer_id: string | null
  status: ContentStatus
  created_at: string
  /** Só quando oculto e só para quem pode ver (autor e admin). */
  hidden?: HiddenInfo | null
}

export interface Post extends Omit<PostSummary, 'excerpt' | 'hidden'> {
  body: string
  voted_by_me: boolean
  edited_at: string | null
  hidden: HiddenInfo | null
  permissions: PostPermissions
}

export interface AnswerPermissions {
  can_edit: boolean
  can_hide: boolean
  can_report: boolean
}

export interface Answer {
  id: string
  post_id: string
  body: string
  author: Author | null
  vote_count: number
  voted_by_me: boolean
  is_accepted: boolean
  status: ContentStatus
  created_at: string
  edited_at: string | null
  hidden: HiddenInfo | null
  permissions: AnswerPermissions
}

export interface Page<T> {
  items: T[]
  next_cursor: string | null
}

export type SortOrder = 'recent' | 'votes'

export interface ListPostsParams {
  q?: string
  tag?: string
  kind?: PostKind
  team?: string
  author?: 'me'
  sort?: SortOrder
  /** Só admin: lista os ocultos. */
  status?: 'hidden'
  cursor?: string
  limit?: number
}

export type NewPost =
  | { kind: 'question'; title: string; body: string; tags: string[] }
  /** `team_id` é opcional e só vale em `post` (pergunta com `team_id` dá 422): sem ele, o post é da própria pessoa. */
  | { kind: 'post'; title: string; body: string; tags: string[]; team_id?: string }

/** `kind` e `team_id` não mudam depois de criados (arquitetura, seção 9). */
export type PostPatch = Partial<{ title: string; body: string; tags: string[] }>

export interface VoteResult {
  vote_count: number
  voted_by_me: boolean
}

export type ReportReason = 'incorrect' | 'offensive' | 'confidential' | 'other'
export type ReportStatus = 'open' | 'actioned' | 'dismissed'
export type ReportTargetType = 'post' | 'answer'
/** "Abertas" = open; "Resolvidas" = actioned + dismissed (HU-16). */
export type ReportFilter = 'open' | 'resolved'

export interface Report {
  id: string
  target_type: ReportTargetType
  target_id: string
  /** Tipo do item denunciado: o tipo do post ou "answer". */
  target_kind: PostKind | 'answer'
  /** Post a abrir para ver o conteúdo (a própria pergunta, no caso de resposta). */
  post_id: string
  target_title: string
  target_excerpt: string
  target_status: ContentStatus
  reason: ReportReason
  details: string | null
  status: ReportStatus
  created_at: string
  resolved_by: Author | null
  resolved_at: string | null
}

export interface AdminUser {
  id: string
  name: string
  email: string
  role: Role
  /** Extensão ao contrato: "Admin desde" (HU-17, critério 3). */
  admin_since?: string | null
}

export type DeletionStatus = 'pending' | 'done'

export interface DeletionRequest {
  id: string
  /** null depois de concluído: nome e e-mail foram apagados. */
  user: (AdminUser & { is_admin: boolean }) | null
  status: DeletionStatus
  requested_at: string
  completed_at: string | null
}

export interface MyDeletionRequest {
  id: string
  status: DeletionStatus
  requested_at: string
}

export interface NewUser {
  name: string
  email: string
  accepted_privacy_notice_version: string
}
