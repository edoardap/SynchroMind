/**
 * Implementação em memória do ForumApi, com dados de exemplo (seed.ts).
 * Reproduz as regras do contrato que mudam o que a tela mostra: sessão (401), papel (403),
 * conteúdo oculto (404 para quem não pode ver), voto idempotente, resposta aceita única,
 * validação 422 com `details`, e-mail repetido (409). Nada daqui vai para produção:
 * troque pelo cliente real em src/api/index.ts.
 */
import { LIMITS, EMAIL_DOMAIN } from '../../config/brand'
import { isValidTag, makeExcerpt, normalizeText, slugifyTag } from '../../lib/text'
import type { DevProfile, DevTools, ForumApi } from '../client'
import { ApiError, type ApiErrorDetail } from '../errors'
import type {
  AdminUser, Answer, DeletionRequest, ListPostsParams, Me, NewPost, Page, Post, PostPatch, PostSummary, Report,
  ReportFilter, ReportReason, Tag, VoteResult,
} from '../types'
import {
  createSeed, SAMPLE_ADMIN_ID, SAMPLE_UNCONFIRMED_ID, SAMPLE_USER_ID,
  type AnswerRec, type PostRec, type ReportRec, type SeedData, type UserRec,
} from './seed'

export interface MemoryApiOptions {
  /** Atraso simulado de cada chamada, em ms. Padrão 120; os testes usam 0. */
  delayMs?: number
  /** Dados iniciais. Padrão: os dados de exemplo. */
  seed?: SeedData
  profile?: DevProfile
  /** Onde guardar o perfil entre recarregamentos. Padrão: sessionStorage, se existir. */
  storage?: Pick<Storage, 'getItem' | 'setItem'> | null
}

const PROFILE_KEY = 'forum.dev.profile'
/** Token de exemplo que o link de confirmação aceita: /confirmar#token=exemplo-valido */
export const SAMPLE_VALID_TOKEN = 'exemplo-valido'

const PROFILE_USER: Record<Exclude<DevProfile, 'anonymous'>, string> = {
  user: SAMPLE_USER_ID,
  admin: SAMPLE_ADMIN_ID,
  unconfirmed: SAMPLE_UNCONFIRMED_ID,
}

function defaultStorage(): Pick<Storage, 'getItem' | 'setItem'> | null {
  try {
    return typeof window !== 'undefined' ? window.sessionStorage : null
  } catch {
    return null
  }
}

function fail(status: number, code: string, message: string, details: ApiErrorDetail[] = []): never {
  throw new ApiError(status, code, message, details)
}

const validation = (details: ApiErrorDetail[]) => fail(422, 'validation_error', 'Há campos inválidos.', details)
const notFound = () => fail(404, 'not_found', 'Não encontrado.')

export function createMemoryApi(options: MemoryApiOptions = {}): ForumApi & { dev: DevTools } {
  const delayMs = options.delayMs ?? 120
  const storage = options.storage === undefined ? defaultStorage() : options.storage
  let db: SeedData = options.seed ?? createSeed()
  let counter = 1000
  let profile: DevProfile = options.profile ?? 'user'
  if (options.profile === undefined) {
    try {
      const saved = storage?.getItem(PROFILE_KEY)
      if (saved === 'user' || saved === 'admin' || saved === 'anonymous' || saved === 'unconfirmed') profile = saved
    } catch {
      /* sem storage */
    }
  }
  /** Conta criada pelo cadastro e ainda sem confirmar; o link de exemplo confirma essa. */
  let signedUpId: string | null = null
  let sessionUserId: string | null = profile === 'anonymous' ? null : (PROFILE_USER[profile] ?? null)

  const nextId = (prefix: string) => `${prefix}-${(counter += 1)}`
  const nowIso = () => new Date().toISOString()
  const wait = () => (delayMs > 0 ? new Promise<void>((resolve) => setTimeout(resolve, delayMs)) : Promise.resolve())

  async function call<T>(fn: () => T): Promise<T> {
    await wait()
    return fn()
  }

  // ---------- sessão e papéis ----------
  const userById = (id: string | null): UserRec | undefined => (id ? db.users.find((u) => u.id === id && !u.deleted) : undefined)
  const sessionUser = (): UserRec | undefined => userById(sessionUserId)

  function requireSession(): UserRec {
    const user = sessionUser()
    if (!user) fail(401, 'unauthenticated', 'Entre para continuar.')
    return user
  }
  function requireConfirmed(): UserRec {
    const user = requireSession()
    if (!user.confirmedAt) fail(403, 'email_not_confirmed', 'Falta confirmar o seu e-mail.')
    return user
  }
  function requireAdmin(): UserRec {
    const user = requireConfirmed()
    if (user.role !== 'admin') fail(403, 'forbidden', 'Você não tem permissão para isso.')
    return user
  }

  const toAuthor = (id: string | null) => {
    const user = userById(id)
    return user ? { id: user.id, name: user.name } : null
  }

  // ---------- conteúdo: visibilidade e conversão ----------
  const isAdmin = (u: UserRec) => u.role === 'admin'
  const canSeeHidden = (viewer: UserRec, authorId: string | null) => isAdmin(viewer) || viewer.id === authorId

  function visiblePost(id: string, viewer: UserRec): PostRec {
    const post = db.posts.find((p) => p.id === id)
    if (!post || (post.hidden && !canSeeHidden(viewer, post.authorId))) return notFound()
    return post
  }

  const answersOf = (postId: string, viewer: UserRec) =>
    db.answers.filter((a) => a.postId === postId && (!a.hidden || canSeeHidden(viewer, a.authorId)))

  const visibleAnswerCount = (postId: string) => db.answers.filter((a) => a.postId === postId && !a.hidden).length

  function effectiveAcceptedId(post: PostRec): string | null {
    const accepted = db.answers.find((a) => a.id === post.acceptedAnswerId)
    return accepted && !accepted.hidden ? accepted.id : null
  }

  const hiddenInfo = (hidden: { at: string; by: string } | null, viewer: UserRec) =>
    hidden ? { at: hidden.at, by: isAdmin(viewer) ? toAuthor(hidden.by) : null } : null

  function toSummary(post: PostRec, viewer?: UserRec): PostSummary {
    const team = db.teams.find((t) => t.id === post.teamId)
    return {
      id: post.id,
      kind: post.kind,
      title: post.title,
      excerpt: makeExcerpt(post.body),
      tags: post.tags.map(toTag),
      author: toAuthor(post.authorId),
      team: team ? { id: team.id, name: team.name } : null,
      vote_count: post.voters.length,
      answer_count: post.kind === 'question' ? visibleAnswerCount(post.id) : 0,
      accepted_answer_id: effectiveAcceptedId(post),
      status: post.hidden ? 'hidden' : 'visible',
      created_at: post.createdAt,
      hidden: viewer ? hiddenInfo(post.hidden, viewer) : undefined,
    }
  }

  function toPost(post: PostRec, viewer: UserRec): Post {
    const { excerpt: _excerpt, hidden: _hidden, ...summary } = toSummary(post)
    void _excerpt
    void _hidden
    const own = post.authorId === viewer.id
    return {
      ...summary,
      body: post.body,
      voted_by_me: post.voters.includes(viewer.id),
      edited_at: post.editedAt,
      hidden: hiddenInfo(post.hidden, viewer),
      permissions: {
        can_edit: own && !post.hidden,
        can_accept: post.kind === 'question' && own && !post.hidden,
        can_hide: isAdmin(viewer) && !own,
        can_report: !own && !post.hidden,
      },
    }
  }

  function toAnswer(answer: AnswerRec, viewer: UserRec): Answer {
    const own = answer.authorId === viewer.id
    const post = db.posts.find((p) => p.id === answer.postId)
    return {
      id: answer.id,
      post_id: answer.postId,
      body: answer.body,
      author: toAuthor(answer.authorId),
      vote_count: answer.voters.length,
      voted_by_me: answer.voters.includes(viewer.id),
      is_accepted: post?.acceptedAnswerId === answer.id && !answer.hidden,
      status: answer.hidden ? 'hidden' : 'visible',
      created_at: answer.createdAt,
      edited_at: answer.editedAt,
      hidden: hiddenInfo(answer.hidden, viewer),
      permissions: {
        can_edit: own && !answer.hidden,
        can_hide: isAdmin(viewer) && !own,
        can_report: !own && !answer.hidden,
      },
    }
  }

  const tagNames = new Map<string, string>(db.tags.map((t) => [t.slug, t.name]))
  function toTag(slug: string): Tag {
    return { slug, name: tagNames.get(slug) ?? slug }
  }

  // ---------- validação ----------
  function checkTags(tags: string[], details: ApiErrorDetail[]): string[] {
    const slugs = [...new Set(tags.map(slugifyTag).filter(Boolean))]
    if (slugs.length > LIMITS.maxTags) {
      details.push({ field: 'tags', code: 'too_many', message: `Use no máximo ${LIMITS.maxTags} tags.` })
    }
    if (slugs.some((t) => !isValidTag(t))) {
      details.push({ field: 'tags', code: 'invalid_format', message: 'Use letras, números e hífen.' })
    }
    return slugs
  }

  function requireText(field: string, value: string | undefined, message: string, details: ApiErrorDetail[]) {
    const text = (value ?? '').trim()
    if (!text) details.push({ field, code: 'required', message })
    else if (text.length > LIMITS.maxText) {
      details.push({ field, code: 'too_long', message: `O texto passou do limite em ${text.length - LIMITS.maxText} caracteres.` })
    }
    return text
  }

  // ---------- busca ----------
  function score(post: PostRec, terms: string[]): number {
    const title = normalizeText(post.title)
    const tags = normalizeText(post.tags.join(' '))
    const text = normalizeText(post.body)
    const answersText = normalizeText(
      db.answers.filter((a) => a.postId === post.id && !a.hidden).map((a) => a.body).join(' '),
    )
    let total = 0
    for (const term of terms) {
      const in_title = title.includes(term)
      const in_tags = tags.includes(term)
      const in_text = text.includes(term)
      const in_answers = answersText.includes(term)
      if (!in_title && !in_tags && !in_text && !in_answers) return 0
      total += (in_title ? 4 : 0) + (in_tags ? 3 : 0) + (in_text ? 2 : 0) + (in_answers ? 1 : 0)
    }
    return total
  }

  function toReport(rec: ReportRec): Report {
    const post = rec.targetType === 'post' ? db.posts.find((p) => p.id === rec.targetId) : db.posts.find((p) => p.id === db.answers.find((a) => a.id === rec.targetId)?.postId)
    const answer = rec.targetType === 'answer' ? db.answers.find((a) => a.id === rec.targetId) : undefined
    const hidden = rec.targetType === 'post' ? post?.hidden : answer?.hidden
    return {
      id: rec.id,
      target_type: rec.targetType,
      target_id: rec.targetId,
      target_kind: rec.targetType === 'answer' ? 'answer' : (post?.kind ?? 'post'),
      post_id: post?.id ?? '',
      target_title: post?.title ?? '',
      target_excerpt: makeExcerpt(answer ? answer.body : (post?.body ?? ''), 140),
      target_status: hidden ? 'hidden' : 'visible',
      reason: rec.reason,
      details: rec.details,
      status: rec.status,
      created_at: rec.createdAt,
      resolved_by: toAuthor(rec.resolvedBy),
      resolved_at: rec.resolvedAt,
    }
  }

  function adminUser(u: UserRec): AdminUser {
    return { id: u.id, name: u.name, email: u.email, role: u.role, admin_since: u.adminSince }
  }

  // ---------- ações de moderação compartilhadas ----------
  function actionReportsOf(type: 'post' | 'answer', id: string, adminId: string) {
    for (const r of db.reports) {
      if (r.targetType === type && r.targetId === id && r.status === 'open') {
        r.status = 'actioned'
        r.resolvedBy = adminId
        r.resolvedAt = nowIso()
      }
    }
  }

  function report(type: 'post' | 'answer', id: string, input: { reason: ReportReason; details?: string }) {
    const user = requireConfirmed()
    if (type === 'post') {
      const post = visiblePost(id, user)
      if (post.authorId === user.id) return fail(403, 'forbidden', 'Você não pode denunciar o próprio conteúdo.')
    } else {
      const answer = db.answers.find((a) => a.id === id)
      if (!answer || (answer.hidden && !canSeeHidden(user, answer.authorId))) return notFound()
      if (answer.authorId === user.id) return fail(403, 'forbidden', 'Você não pode denunciar o próprio conteúdo.')
    }
    if (!['incorrect', 'offensive', 'confidential', 'other'].includes(input.reason)) {
      return validation([{ field: 'reason', code: 'required', message: 'Escolha um motivo.' }])
    }
    if ((input.details ?? '').length > LIMITS.maxReportDetails) {
      return validation([{ field: 'details', code: 'too_long', message: 'Use até 300 caracteres.' }])
    }
    if (db.reports.some((r) => r.targetType === type && r.targetId === id && r.reporterId === user.id)) {
      return fail(409, 'already_reported', 'Você já denunciou este conteúdo.')
    }
    db.reports.push({
      id: nextId('r'), targetType: type, targetId: id, reporterId: user.id, reason: input.reason,
      details: input.details?.trim() || null, status: 'open', createdAt: nowIso(), resolvedBy: null, resolvedAt: null,
    })
  }

  function vote(type: 'post' | 'answer', id: string, on: boolean): VoteResult {
    const user = requireConfirmed()
    const rec = type === 'post' ? visiblePost(id, user) : db.answers.find((a) => a.id === id)
    if (!rec || (type === 'answer' && (rec as AnswerRec).hidden && !canSeeHidden(user, (rec as AnswerRec).authorId))) return notFound()
    if (rec.authorId === user.id) return fail(422, 'cannot_vote_own_content', 'Você não pode votar no próprio conteúdo.')
    const has = rec.voters.includes(user.id)
    if (on && !has) rec.voters.push(user.id)
    if (!on && has) rec.voters = rec.voters.filter((v) => v !== user.id)
    return { vote_count: rec.voters.length, voted_by_me: rec.voters.includes(user.id) }
  }

  const api: ForumApi & { dev: DevTools } = {
    // ---------- acesso ----------
    getPrivacyNotice: () => call(() => ({ version: db.privacyVersion, text: db.privacyText })),

    createUser: (input) =>
      call(() => {
        const details: ApiErrorDetail[] = []
        const name = input.name.trim()
        const email = input.email.trim().toLowerCase()
        if (!name) details.push({ field: 'name', code: 'required', message: 'Informe o seu nome.' })
        if (!email) details.push({ field: 'email', code: 'required', message: 'Informe o seu e-mail.' })
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          details.push({ field: 'email', code: 'invalid_format', message: 'Esse e-mail parece incompleto.' })
        }
        if (details.length) return validation(details)
        if (!email.endsWith(`@${EMAIL_DOMAIN}`)) {
          return fail(422, 'email_domain_not_allowed', 'Só e-mails da empresa são aceitos.', [
            { field: 'email', code: 'email_domain_not_allowed', message: `Use um e-mail que termine com @${EMAIL_DOMAIN}.` },
          ])
        }
        if (input.accepted_privacy_notice_version !== db.privacyVersion) {
          return fail(422, 'privacy_notice_not_accepted', 'Para criar a conta, marque que leu o aviso.', [
            { field: 'accepted_privacy_notice_version', code: 'privacy_notice_not_accepted', message: 'Para criar a conta, marque que leu o aviso.' },
          ])
        }
        if (db.users.some((u) => u.email === email && !u.deleted)) {
          return fail(409, 'email_already_registered', 'Já existe uma conta com esse e-mail.')
        }
        const user: UserRec = { id: nextId('u'), name, email, role: 'user', confirmedAt: null, adminSince: null, deleted: false }
        db.users.push(user)
        signedUpId = user.id
      }),

    // Resposta sempre igual, exista ou não a conta (contrato, seção 5.3).
    requestLink: (email) => call(() => { void email }),

    verifyLink: (token) =>
      call(() => {
        if (token !== SAMPLE_VALID_TOKEN) return fail(410, 'link_invalid_or_expired', 'Este link não vale mais.')
        const pending = userById(signedUpId)
        const user = pending ?? userById(PROFILE_USER.user)
        if (!user) return fail(410, 'link_invalid_or_expired', 'Este link não vale mais.')
        user.confirmedAt ??= nowIso()
        sessionUserId = user.id
        profile = user.role === 'admin' ? 'admin' : 'user'
        return buildMe(user)
      }),

    logout: () => call(() => { sessionUserId = null; profile = 'anonymous' }),

    getMe: () => call(() => buildMe(requireSession())),

    requestDeletion: () =>
      call(() => {
        const user = requireConfirmed()
        if (db.deletions.some((d) => d.userId === user.id && d.status === 'pending')) {
          return fail(409, 'deletion_already_requested', 'Você já tem um pedido de exclusão pendente.')
        }
        const rec = { id: nextId('d'), userId: user.id, status: 'pending' as const, requestedAt: nowIso(), completedAt: null }
        db.deletions.push(rec)
        return { id: rec.id, status: rec.status, requested_at: rec.requestedAt }
      }),

    getMyDeletionRequest: () =>
      call(() => {
        const user = requireConfirmed()
        const rec = db.deletions.find((d) => d.userId === user.id && d.status === 'pending')
        return rec ? { id: rec.id, status: rec.status, requested_at: rec.requestedAt } : null
      }),

    listTeams: () => call(() => { requireConfirmed(); return db.teams.map((t) => ({ ...t })) }),

    // ---------- conteúdo ----------
    listPosts: (params: ListPostsParams) =>
      call((): Page<PostSummary> => {
        const user = requireConfirmed()
        if (params.status === 'hidden' && !isAdmin(user)) return fail(403, 'forbidden', 'Você não tem permissão para isso.')
        const terms = normalizeText(params.q ?? '').split(/\s+/).filter(Boolean)
        let rows = db.posts.filter((p) => {
          if (params.status === 'hidden') return !!p.hidden
          if (params.author === 'me') return p.authorId === user.id
          return !p.hidden
        })
        if (params.kind) rows = rows.filter((p) => p.kind === params.kind)
        if (params.team) rows = rows.filter((p) => p.teamId === params.team)
        // A tag não diferencia maiúsculas e minúsculas: "IA", "ia" e "Ia" são a mesma.
        if (params.tag) rows = rows.filter((p) => p.tags.includes(slugifyTag(params.tag as string)))
        let scored = rows.map((p) => ({ p, s: terms.length ? score(p, terms) : 1 }))
        if (terms.length) scored = scored.filter((x) => x.s > 0)
        scored.sort((a, b) => {
          if (terms.length) {
            if (b.s !== a.s) return b.s - a.s
            if (b.p.voters.length !== a.p.voters.length) return b.p.voters.length - a.p.voters.length
          } else if (params.sort === 'votes' && b.p.voters.length !== a.p.voters.length) {
            return b.p.voters.length - a.p.voters.length
          }
          return b.p.createdAt.localeCompare(a.p.createdAt) || a.p.id.localeCompare(b.p.id)
        })
        const limit = params.limit ?? LIMITS.pageSize
        const offset = params.cursor ? Number.parseInt(params.cursor, 10) || 0 : 0
        const slice = scored.slice(offset, offset + limit)
        const next = offset + limit < scored.length ? String(offset + limit) : null
        return { items: slice.map((x) => toSummary(x.p, user)), next_cursor: next }
      }),

    createPost: (input: NewPost) =>
      call(() => {
        const user = requireConfirmed()
        const details: ApiErrorDetail[] = []
        const title = requireText('title', input.title, 'Informe o título.', details)
        const rec: PostRec = {
          id: nextId('p'), kind: input.kind, title, body: '', tags: [],
          authorId: user.id, teamId: null, voters: [], acceptedAnswerId: null, hidden: null, createdAt: nowIso(), editedAt: null,
        }
        if (input.kind === 'question' && (input as { team_id?: string | null }).team_id) {
          details.push({ field: 'team_id', code: 'not_allowed', message: 'Só posts podem ser publicados em nome de um time.' })
        }
        rec.body = requireText('body', input.body, input.kind === 'question' ? 'Descreva a dúvida.' : 'Escreva o texto do post.', details)
        if (input.kind === 'post' && input.team_id) {
          if (!db.teams.some((t) => t.id === input.team_id)) details.push({ field: 'team_id', code: 'invalid', message: 'Esse time não existe.' })
          rec.teamId = input.team_id
        }
        rec.tags = checkTags(input.tags, details)
        if (details.length) return validation(details)
        for (const slug of rec.tags) if (!tagNames.has(slug)) tagNames.set(slug, slug)
        db.posts.unshift(rec)
        return toPost(rec, user)
      }),

    getPost: (id) => call(() => { const user = requireConfirmed(); return toPost(visiblePost(id, user), user) }),

    updatePost: (id, patch: PostPatch) =>
      call(() => {
        const user = requireConfirmed()
        const post = visiblePost(id, user)
        if (post.authorId !== user.id) return fail(403, 'forbidden', 'Só quem escreveu pode editar.')
        if (post.hidden) return fail(409, 'content_hidden', 'Este conteúdo está oculto e não pode ser editado.')
        const details: ApiErrorDetail[] = []
        const next = { ...post }
        if (patch.title !== undefined) next.title = requireText('title', patch.title, 'Este campo não pode ficar vazio.', details)
        if (patch.body !== undefined) next.body = requireText('body', patch.body, 'Este campo não pode ficar vazio.', details)
        if (patch.tags !== undefined) next.tags = checkTags(patch.tags, details)
        if (details.length) return validation(details)
        Object.assign(post, next, { editedAt: nowIso() })
        return toPost(post, user)
      }),

    listAnswers: (postId) =>
      call(() => {
        const user = requireConfirmed()
        const post = visiblePost(postId, user)
        const rows = answersOf(postId, user).slice()
        rows.sort((a, b) => {
          const aa = post.acceptedAnswerId === a.id ? 1 : 0
          const ab = post.acceptedAnswerId === b.id ? 1 : 0
          if (aa !== ab) return ab - aa
          if (b.voters.length !== a.voters.length) return b.voters.length - a.voters.length
          return a.createdAt.localeCompare(b.createdAt)
        })
        return rows.map((a) => toAnswer(a, user))
      }),

    createAnswer: (postId, body) =>
      call(() => {
        const user = requireConfirmed()
        const post = visiblePost(postId, user)
        if (post.kind !== 'question') return fail(422, 'not_a_question', 'Só perguntas recebem respostas.')
        const details: ApiErrorDetail[] = []
        const text = requireText('body', body, 'Escreva a sua resposta antes de enviar.', details)
        if (details.length) return validation(details)
        const rec: AnswerRec = { id: nextId('a'), postId, body: text, authorId: user.id, voters: [], hidden: null, createdAt: nowIso(), editedAt: null }
        db.answers.push(rec)
        return toAnswer(rec, user)
      }),

    updateAnswer: (id, body) =>
      call(() => {
        const user = requireConfirmed()
        const answer = db.answers.find((a) => a.id === id)
        if (!answer || (answer.hidden && !canSeeHidden(user, answer.authorId))) return notFound()
        if (answer.authorId !== user.id) return fail(403, 'forbidden', 'Só quem escreveu pode editar.')
        if (answer.hidden) return fail(409, 'content_hidden', 'Este conteúdo está oculto e não pode ser editado.')
        const details: ApiErrorDetail[] = []
        const text = requireText('body', body, 'Este campo não pode ficar vazio.', details)
        if (details.length) return validation(details)
        answer.body = text
        answer.editedAt = nowIso()
        return toAnswer(answer, user)
      }),

    acceptAnswer: (postId, answerId) =>
      call(() => {
        const user = requireConfirmed()
        const post = visiblePost(postId, user)
        if (post.kind !== 'question' || post.authorId !== user.id) return fail(403, 'forbidden', 'Só o autor da pergunta aceita respostas.')
        const answer = db.answers.find((a) => a.id === answerId && a.postId === postId && !a.hidden)
        if (!answer) return fail(422, 'answer_not_in_post', 'Essa resposta não é desta pergunta.')
        post.acceptedAnswerId = answer.id
        return toPost(post, user)
      }),

    unacceptAnswer: (postId) =>
      call(() => {
        const user = requireConfirmed()
        const post = visiblePost(postId, user)
        if (post.kind !== 'question' || post.authorId !== user.id) return fail(403, 'forbidden', 'Só o autor da pergunta aceita respostas.')
        post.acceptedAnswerId = null
      }),

    votePost: (id) => call(() => vote('post', id, true)),
    unvotePost: (id) => call(() => vote('post', id, false)),
    voteAnswer: (id) => call(() => vote('answer', id, true)),
    unvoteAnswer: (id) => call(() => vote('answer', id, false)),

    suggestTags: (q) =>
      call(() => {
        requireConfirmed()
        const wanted = slugifyTag(q)
        const used = new Map<string, number>()
        for (const p of db.posts) if (!p.hidden) for (const t of p.tags) used.set(t, (used.get(t) ?? 0) + 1)
        return [...used.entries()]
          .filter(([slug]) => slug.startsWith(wanted))
          .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
          .slice(0, 8)
          .map(([slug]) => toTag(slug))
      }),

    // ---------- moderação ----------
    reportPost: (id, input) => call(() => report('post', id, input)),
    reportAnswer: (id, input) => call(() => report('answer', id, input)),

    hidePost: (id) =>
      call(() => {
        const admin = requireAdmin()
        const post = visiblePost(id, admin)
        if (post.authorId === admin.id) return fail(403, 'forbidden', 'Você não pode ocultar o próprio conteúdo.')
        post.hidden = { at: nowIso(), by: admin.id }
        actionReportsOf('post', id, admin.id)
        return toPost(post, admin)
      }),
    restorePost: (id) =>
      call(() => {
        const admin = requireAdmin()
        const post = visiblePost(id, admin)
        post.hidden = null
        return toPost(post, admin)
      }),
    hideAnswer: (id) =>
      call(() => {
        const admin = requireAdmin()
        const answer = db.answers.find((a) => a.id === id)
        if (!answer) return notFound()
        answer.hidden = { at: nowIso(), by: admin.id }
        actionReportsOf('answer', id, admin.id)
        return toAnswer(answer, admin)
      }),
    restoreAnswer: (id) =>
      call(() => {
        const admin = requireAdmin()
        const answer = db.answers.find((a) => a.id === id)
        if (!answer) return notFound()
        answer.hidden = null
        return toAnswer(answer, admin)
      }),

    // ---------- administração ----------
    listReports: (filter: ReportFilter) =>
      call((): Page<Report> => {
        requireAdmin()
        const rows = db.reports
          .filter((r) => (filter === 'open' ? r.status === 'open' : r.status !== 'open'))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        return { items: rows.map(toReport), next_cursor: null }
      }),

    dismissReport: (id) =>
      call(() => {
        const admin = requireAdmin()
        const rec = db.reports.find((r) => r.id === id)
        if (!rec) return notFound()
        if (rec.status !== 'open') return fail(409, 'report_not_open', 'Esta denúncia já foi tratada.')
        rec.status = 'dismissed'
        rec.resolvedBy = admin.id
        rec.resolvedAt = nowIso()
        return toReport(rec)
      }),

    listUsers: ({ role, q }) =>
      call(() => {
        requireAdmin()
        const wanted = normalizeText(q ?? '').trim()
        return db.users
          .filter((u) => !u.deleted && u.confirmedAt)
          .filter((u) => (role ? u.role === role : true))
          .filter((u) => !wanted || normalizeText(`${u.name} ${u.email}`).includes(wanted))
          .map(adminUser)
      }),

    promoteUser: (id) =>
      call(() => {
        requireAdmin()
        const user = userById(id)
        if (!user) return notFound()
        if (user.role === 'admin') return fail(409, 'already_admin', 'Essa pessoa já é administradora.')
        user.role = 'admin'
        user.adminSince = nowIso()
        return adminUser(user)
      }),

    listDeletionRequests: (status) =>
      call(() => {
        requireAdmin()
        return db.deletions
          .filter((d) => d.status === status)
          .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))
          .map((d): DeletionRequest => {
            const user = userById(d.userId)
            return {
              id: d.id,
              user: user ? { ...adminUser(user), is_admin: user.role === 'admin' } : null,
              status: d.status,
              requested_at: d.requestedAt,
              completed_at: d.completedAt,
            }
          })
      }),

    approveDeletion: (id) =>
      call(() => {
        requireAdmin()
        const rec = db.deletions.find((d) => d.id === id)
        if (!rec) return notFound()
        if (rec.status === 'done') return { id: rec.id, user: null, status: rec.status, requested_at: rec.requestedAt, completed_at: rec.completedAt }
        const user = userById(rec.userId)
        if (user?.role === 'admin' && db.users.filter((u) => u.role === 'admin' && !u.deleted).length <= 1) {
          return fail(409, 'last_admin', 'Esta é a última pessoa administradora.')
        }
        if (user) {
          user.deleted = true
          for (const p of db.posts) if (p.authorId === user.id) p.authorId = null
          for (const a of db.answers) if (a.authorId === user.id) a.authorId = null
          for (const r of db.reports) if (r.reporterId === user.id) r.reporterId = ''
        }
        rec.status = 'done'
        rec.userId = null
        rec.completedAt = nowIso()
        return { id: rec.id, user: null, status: rec.status, requested_at: rec.requestedAt, completed_at: rec.completedAt }
      }),

    dev: {
      getProfile: () => profile,
      setProfile: (next) => {
        profile = next
        sessionUserId = next === 'anonymous' ? null : (PROFILE_USER[next] ?? null)
        try {
          storage?.setItem(PROFILE_KEY, next)
        } catch {
          /* sem storage */
        }
      },
      reset: () => {
        db = createSeed()
        tagNames.clear()
        for (const t of db.tags) tagNames.set(t.slug, t.name)
      },
    },
  }

  function buildMe(user: UserRec): Me {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      email_confirmed_at: user.confirmedAt,
      teams: [],
    }
  }

  return api
}
