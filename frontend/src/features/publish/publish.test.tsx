import { screen, waitFor, within } from '@testing-library/react'
import { ApiError, type Post } from '../../api'
import { createSeed } from '../../api/memory/seed'
import { renderApp } from '../../test/render'

const fakePost = (id: string): Post => ({
  id, kind: 'post', title: 't', body: 'b', tags: [], author: { id: 'u-marina', name: 'Marina Souza' },
  team: null, vote_count: 0, answer_count: 0, accepted_answer_id: null, status: 'visible', created_at: new Date().toISOString(),
  voted_by_me: false, edited_at: null, hidden: null,
  permissions: { can_edit: true, can_accept: false, can_hide: false, can_report: false },
})

describe('Criar um post (HU-06, HU-11, HU-18)', () => {
  async function open(options: Parameters<typeof renderApp>[0] = {}) {
    const utils = renderApp({ route: '/publicar/post', ...options })
    await screen.findByRole('heading', { name: 'Criar um post' })
    return utils
  }

  it('é um formulário só, com Título, Texto, time opcional e Tags, sem campos de problema e solução', async () => {
    await open()
    expect(screen.getByLabelText('Título')).toBeInTheDocument()
    expect(screen.getByLabelText('Texto')).toBeInTheDocument()
    expect(await screen.findByRole('combobox', { name: /publicar em nome de um time/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/tags/i)).toBeInTheDocument()
    expect(screen.queryByLabelText('Problema')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Solução')).not.toBeInTheDocument()
    expect(screen.getByText(/não inclua senhas, chaves de acesso, dados de clientes/i)).toBeInTheDocument()
  })

  it('o seletor de time começa vazio e é opcional', async () => {
    await open()
    const team = await screen.findByRole('combobox', { name: /publicar em nome de um time/i })
    expect(team).toHaveValue('')
    expect(team).not.toBeRequired()
    expect(team).not.toHaveAttribute('aria-required')
  })

  it('não publica com campos vazios e diz quais faltam (HU-06, critério 2)', async () => {
    const createPost = vi.fn()
    const { user } = await open({ overrides: { createPost } })
    await user.click(screen.getByRole('button', { name: 'Publicar post' }))
    const summary = await screen.findByRole('alert')
    expect(within(summary).getByText('Informe o título.')).toBeInTheDocument()
    expect(within(summary).getByText('Escreva o texto do post.')).toBeInTheDocument()
    expect(screen.getByLabelText('Título')).toHaveFocus()
    expect(createPost).not.toHaveBeenCalled()
  })

  it('publica sem time, com tags, e vai ao detalhe com o aviso "Publicado" (critérios de HU-06 e HU-11)', async () => {
    const { user, router } = await open()
    await user.type(screen.getByLabelText('Título'), 'Meu título')
    await user.type(screen.getByLabelText('Texto'), 'Um assunto qualquer da empresa')
    await user.type(screen.getByLabelText(/tags/i), 'ia')
    await user.click(await screen.findByRole('option', { name: '#IA' }))
    expect(screen.getByRole('button', { name: 'Remover tag IA' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Publicar post' }))
    await waitFor(() => expect(router.state.location.pathname).toMatch(/^\/posts\//))
    expect(await screen.findByRole('heading', { level: 1, name: 'Meu título' })).toBeInTheDocument()
    expect(screen.getByText('Publicado. Todos na empresa já podem ver.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '#IA' })).toBeInTheDocument()
    expect(screen.queryByText(/^Time /)).not.toBeInTheDocument() // sem time: o post é só da pessoa
  })

  it('publica em nome de um time: o post mostra o time e o autor (HU-18, critério 1)', async () => {
    const { user } = await open()
    await user.click(await screen.findByRole('combobox', { name: /publicar em nome de um time/i }))
    await user.click(await screen.findByRole('option', { name: 'Pagamentos' }))
    await user.type(screen.getByLabelText('Título'), 'Novidade do time')
    await user.type(screen.getByLabelText('Texto'), 'Texto do post')
    await user.click(screen.getByRole('button', { name: 'Publicar post' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Novidade do time' })).toBeInTheDocument()
    expect(screen.getAllByText(/Time Pagamentos/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Marina Souza/).length).toBeGreaterThan(0)
  })

  it('mantém o texto e avisa se o envio falhar', async () => {
    const createPost = vi.fn().mockRejectedValue(new ApiError(500, 'internal_error', 'x'))
    const { user } = await open({ overrides: { createPost } })
    await user.type(screen.getByLabelText('Título'), 'Meu título')
    await user.type(screen.getByLabelText('Texto'), 'Conteúdo')
    await user.click(screen.getByRole('button', { name: 'Publicar post' }))
    expect(await screen.findByText('Não foi possível publicar. O texto continua aqui. Tente de novo.')).toBeInTheDocument()
    expect(screen.getByLabelText('Texto')).toHaveValue('Conteúdo')
  })

  it('mostra o botão em andamento enquanto publica', async () => {
    let resolve: (p: Post) => void = () => {}
    const createPost = vi.fn().mockReturnValue(new Promise<Post>((r) => { resolve = r }))
    const { user } = await open({ overrides: { createPost } })
    await user.type(screen.getByLabelText('Título'), 'T')
    await user.type(screen.getByLabelText('Texto'), 'S')
    await user.click(screen.getByRole('button', { name: 'Publicar post' }))
    expect(await screen.findByRole('button', { name: 'Publicando...' })).toBeDisabled()
    resolve(fakePost('novo'))
  })

  it('erro ao carregar os times não impede publicar: mensagem e "Tentar de novo"', async () => {
    const listTeams = vi.fn().mockRejectedValueOnce(new ApiError(500, 'x', 'x')).mockResolvedValue([{ id: 't1', name: 'Pagamentos' }])
    const { user } = await open({ overrides: { listTeams } })
    expect(await screen.findByText('Não foi possível carregar os times.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Publicar post' })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }))
    expect(await screen.findByRole('combobox', { name: /publicar em nome de um time/i })).toBeInTheDocument()
  })

  it('sem times cadastrados, avisa e deixa publicar em nome próprio', async () => {
    const seed = createSeed()
    seed.teams = []
    await open({ seed })
    expect(await screen.findByText(/nenhum time cadastrado ainda/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Publicar post' })).toBeEnabled()
  })

  it('pede confirmação antes de descartar o que foi digitado', async () => {
    const { user, router } = await open()
    await user.type(screen.getByLabelText('Título'), 'Rascunho')
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    const dialog = await screen.findByRole('dialog', { name: 'Descartar o que você escreveu?' })
    await user.click(within(dialog).getByRole('button', { name: 'Continuar editando' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Título')).toHaveValue('Rascunho')
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Descartar' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })

  it('cancela direto quando nada foi digitado', async () => {
    const { user, router } = await open()
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('campo de tags (HU-11)', () => {
  async function openTags() {
    const utils = renderApp({ route: '/publicar/post' })
    await screen.findByRole('heading', { name: 'Criar um post' })
    return utils
  }

  it('sugere só as tags de exemplo, com a caixa original dos nomes (critério 2)', async () => {
    const { user } = await openTags()
    await user.type(screen.getByLabelText(/tags/i), 'syn')
    expect(await screen.findByRole('option', { name: '#Synchro4me' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '#SynchroTDF' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '#SynchroDFE' })).toBeInTheDocument()
    await user.click(screen.getByRole('option', { name: '#SynchroTDF' }))
    expect(screen.getByRole('button', { name: 'Remover tag SynchroTDF' })).toBeInTheDocument()
  })

  it('a sugestão ignora maiúsculas e minúsculas', async () => {
    const { user } = await openTags()
    await user.type(screen.getByLabelText(/tags/i), 'CORP')
    expect(await screen.findByRole('option', { name: '#Corporativo' })).toBeInTheDocument()
  })

  it('oferece criar uma tag nova, recusa formato inválido e limita a 5', async () => {
    const { user } = await openTags()
    const field = screen.getByLabelText(/tags/i)
    await user.type(field, 'novidade')
    expect(await screen.findByRole('option', { name: "Criar tag 'novidade'" })).toBeInTheDocument()
    await user.clear(field)
    await user.type(field, 'a_b{enter}')
    expect(await screen.findByText('Use letras, números e hífen.')).toBeInTheDocument()
    await user.clear(field)
    for (const tag of ['um', 'dois', 'tres', 'quatro', 'cinco']) await user.type(field, `${tag}{enter}`)
    expect(screen.getAllByRole('button', { name: /remover tag/i })).toHaveLength(5)
    expect(field).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Remover tag cinco' }))
    expect(field).toBeEnabled()
  })
})

describe('B3 publicar pergunta (HU-07)', () => {
  it('exige título e descrição', async () => {
    const { user } = renderApp({ route: '/publicar/pergunta' })
    await screen.findByLabelText('Qual é a sua dúvida?')
    await user.click(screen.getByRole('button', { name: 'Publicar pergunta' }))
    const summary = await screen.findByRole('alert')
    expect(within(summary).getByText('Informe o título.')).toBeInTheDocument()
    expect(within(summary).getByText('Descreva a dúvida.')).toBeInTheDocument()
  })

  it('não tem seletor de time (time só vale em post)', async () => {
    renderApp({ route: '/publicar/pergunta' })
    await screen.findByLabelText('Qual é a sua dúvida?')
    expect(screen.queryByRole('combobox', { name: /time/i })).not.toBeInTheDocument()
  })

  it('traz o termo da busca já preenchido no título', async () => {
    renderApp({ route: '/publicar/pergunta?titulo=erro%20de%20rede' })
    expect(await screen.findByLabelText('Qual é a sua dúvida?')).toHaveValue('erro de rede')
  })

  it('publica e leva à pergunta com o aviso "Pergunta publicada."', async () => {
    const { user } = renderApp({ route: '/publicar/pergunta' })
    await user.type(await screen.findByLabelText('Qual é a sua dúvida?'), 'Como faço X?')
    await user.type(screen.getByLabelText('Mais contexto'), 'Já tentei Y.')
    await user.click(screen.getByRole('button', { name: 'Publicar pergunta' }))
    expect(await screen.findByRole('heading', { name: 'Como faço X?' })).toBeInTheDocument()
    expect(screen.getByText('Pergunta publicada.')).toBeInTheDocument()
    expect(await screen.findByText('Ainda ninguém respondeu.')).toBeInTheDocument()
  })

  it('sugere publicações parecidas enquanto a pessoa digita o título, em nova aba', async () => {
    const { user } = renderApp({ route: '/publicar/pergunta' })
    await user.type(await screen.findByLabelText('Qual é a sua dúvida?'), 'certificado')
    const block = await screen.findByRole('region', { name: 'Talvez já esteja respondido' }, { timeout: 3000 })
    const link = await within(block).findByRole('link', { name: /aviso de certificado/i })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })
})
