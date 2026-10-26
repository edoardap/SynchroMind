import type {
  AdminUser, Answer, DeletionRequest, DeletionStatus, ListPostsParams, Me, MyDeletionRequest, NewPost, NewUser,
  Page, Post, PostPatch, PostSummary, PrivacyNotice, Report, ReportFilter, ReportReason, Tag, Team, VoteResult,
} from './types'

/**
 * Interface da camada de dados. Cada método é uma rota de /api/v1
 * (docs/arquitetura/forum-conhecimento.md, seção 5.2). As telas só conhecem esta interface:
 * para trocar a implementação em memória pelo cliente real, escreva um objeto que a satisfaça
 * (ou o cliente gerado do OpenAPI com um adaptador) e troque em src/api/index.ts.
 *
 * Erros: lançar ApiError (status, code, message, details), como o formato de erro do contrato.
 */
export interface ForumApi {
  // Acesso (acesso)
  getPrivacyNotice(): Promise<PrivacyNotice> // GET /privacy-notice
  createUser(input: NewUser): Promise<void> // POST /users
  requestLink(email: string): Promise<void> // POST /auth/links
  verifyLink(token: string): Promise<Me> // POST /auth/links/verify
  logout(): Promise<void> // POST /auth/logout
  getMe(): Promise<Me> // GET /me (401 sem sessão)
  requestDeletion(input: { acknowledged: true }): Promise<MyDeletionRequest> // POST /me/deletion-request
  getMyDeletionRequest(): Promise<MyDeletionRequest | null> // GET /me/deletion-request (404 vira null)

  // Times
  listTeams(): Promise<Team[]> // GET /teams

  // Conteúdo
  listPosts(params: ListPostsParams): Promise<Page<PostSummary>> // GET /posts
  createPost(input: NewPost): Promise<Post> // POST /posts
  getPost(id: string): Promise<Post> // GET /posts/{id}
  updatePost(id: string, patch: PostPatch): Promise<Post> // PATCH /posts/{id}
  listAnswers(postId: string): Promise<Answer[]> // GET /posts/{id}/answers
  createAnswer(postId: string, body: string): Promise<Answer> // POST /posts/{id}/answers
  updateAnswer(id: string, body: string): Promise<Answer> // PATCH /answers/{id}
  acceptAnswer(postId: string, answerId: string): Promise<Post> // PUT /posts/{id}/accepted-answer
  unacceptAnswer(postId: string): Promise<void> // DELETE /posts/{id}/accepted-answer
  votePost(id: string): Promise<VoteResult> // PUT /posts/{id}/vote
  unvotePost(id: string): Promise<VoteResult> // DELETE /posts/{id}/vote
  voteAnswer(id: string): Promise<VoteResult> // PUT /answers/{id}/vote
  unvoteAnswer(id: string): Promise<VoteResult> // DELETE /answers/{id}/vote
  suggestTags(q: string): Promise<Tag[]> // GET /tags?q=

  // Moderação
  reportPost(id: string, input: { reason: ReportReason; details?: string }): Promise<void> // POST /posts/{id}/reports
  reportAnswer(id: string, input: { reason: ReportReason; details?: string }): Promise<void> // POST /answers/{id}/reports
  hidePost(id: string): Promise<Post> // POST /posts/{id}/hide
  restorePost(id: string): Promise<Post> // POST /posts/{id}/restore
  hideAnswer(id: string): Promise<Answer> // POST /answers/{id}/hide
  restoreAnswer(id: string): Promise<Answer> // POST /answers/{id}/restore

  // Administração
  listReports(filter: ReportFilter): Promise<Page<Report>> // GET /admin/reports?status=
  dismissReport(id: string): Promise<Report> // PATCH /admin/reports/{id}
  listUsers(params: { role?: 'admin'; q?: string }): Promise<AdminUser[]> // GET /admin/users
  promoteUser(id: string): Promise<AdminUser> // POST /admin/users/{id}/promote
  listDeletionRequests(status: DeletionStatus): Promise<DeletionRequest[]> // GET /admin/deletion-requests
  approveDeletion(id: string): Promise<DeletionRequest> // POST /admin/deletion-requests/{id}/approve
}

/** Perfis do controle de desenvolvimento (só a implementação em memória tem). */
export type DevProfile = 'user' | 'admin' | 'anonymous' | 'unconfirmed'

export interface DevTools {
  getProfile(): DevProfile
  setProfile(profile: DevProfile): void
  reset(): void
}
