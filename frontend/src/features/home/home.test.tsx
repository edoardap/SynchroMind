import { screen, waitFor, within } from '@testing-library/react'
import { ApiError } from '../../api'
import { createSeed } from '../../api/memory/seed'
import { textOf } from '../../test/matchers'
import { renderApp } from '../../test/render'

async function openHome(options: Parameters<typeof renderApp>[0] = {}) {
  const utils = renderApp({ route: '/', ...options })
  await screen.findByRole('heading', { name: /o que você precisa resolver/i })
  return utils
}

const findList = () => screen.findByRole('list', { name: /publicações/i })
// Só os itens da lista de publicações (os <li> das tags ficam dentro deles).
const onlyPosts = (list: HTMLElement, rows: HTMLElement[]) => rows.filter((row) => row.parentElement === list)
const listItems = async () => {
  const list = await findList()
  return onlyPosts(list, await within(list).findAllByRole('listitem'))
}
const currentItems = () => {
  const list = screen.getByRole('list', { name: /publicações/i })
  return onlyPosts(list, within(list).getAllByRole('listitem'))
}

describe('B1 início: lista', () => {
  it('lista as publicações visíveis, da mais recente para a mais antiga, sem as ocultas (HU-15)', async () => {
    await openHome()
    const items = await listItems()
    expect(items.length).toBeGreaterThan(5)
    expect(within(items[0] as HTMLElement).getByRole('link', { name: /dados de clientes nos nossos testes/i })).toBeInTheDocument()
    expect(screen.queryByText(/senha de acesso colada/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/dica de exemplo que a marina/i)).not.toBeInTheDocument()
  })

  it('mostra tipo, estado da pergunta, autor, votos e respostas em cada item', async () => {
    await openHome()
    const item = (await screen.findByRole('link', { name: /pedir acesso ao ambiente/i })).closest('li') as HTMLElement
    expect(within(item).getByText('Pergunta')).toBeInTheDocument()
    expect(within(item).getByText('Respondida')).toBeInTheDocument()
    expect(within(item).getByText(/Beatriz Alves/)).toBeInTheDocument()
    expect(within(item).getByText(textOf('1 voto'))).toBeInTheDocument()
    expect(within(item).getByText(textOf('2 respostas'))).toBeInTheDocument() // a resposta oculta (a-3) não conta: são 3 no total
    expect(within(item).getByRole('link', { name: '#Corporativo' })).toBeInTheDocument()
  })

  it('mostra "Conta excluída" no lugar do autor sem nome (HU-05, critério 2)', async () => {
    await openHome()
    const item = (await screen.findByRole('link', { name: /pessoa que já saiu da empresa/i })).closest('li') as HTMLElement
    expect(within(item).getByText('Conta excluída')).toBeInTheDocument()
  })

  it('post em nome de um time mostra o selo "Post", o time e o autor (HU-18, critério 1)', async () => {
    await openHome()
    const item = (await screen.findByRole('link', { name: /guia de uso do synchro4me/i })).closest('li') as HTMLElement
    expect(within(item).getByText('Post')).toBeInTheDocument()
    expect(within(item).getByText(/Time Pagamentos/)).toBeInTheDocument()
    expect(within(item).getByText(/Tiago Barros/)).toBeInTheDocument()
  })

  it('ordena por mais votados quando pedido', async () => {
    const { user } = await openHome()
    await user.selectOptions(await screen.findByLabelText('Ordenar por'), 'votes')
    await waitFor(() => expect(within(currentItems()[0] as HTMLElement).getByRole('link', { name: /aviso de certificado/i })).toBeInTheDocument()) // 5 votos
  })

  it('carrega mais de 20 em 20 com o botão "Carregar mais"', async () => {
    const seed = createSeed()
    const base = seed.posts[0]!
    seed.posts = Array.from({ length: 25 }, (_, i) => ({ ...base, id: `x-${i}`, title: `Publicação em massa ${i}`, hidden: null, createdAt: new Date(Date.UTC(2026, 0, 1, 0, i)).toISOString() }))
    const { user } = await openHome({ seed })
    expect(await listItems()).toHaveLength(20)
    await user.click(screen.getByRole('button', { name: 'Carregar mais' }))
    expect(await listItems()).toHaveLength(25)
    expect(screen.queryByRole('button', { name: 'Carregar mais' })).not.toBeInTheDocument()
  })
})

describe('B1 início: busca (HU-10)', () => {
  it('acha sem diferenciar acento nem maiúscula e conta os resultados', async () => {
    const { user } = await openHome()
    await user.type(screen.getByRole('searchbox', { name: /buscar publicações/i }), 'HOMOLOGACAO')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    expect(await screen.findByText(/1 resultado para 'HOMOLOGACAO'/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /pedir acesso ao ambiente/i })).toBeInTheDocument()
  })

  it('acha um post pelo texto de uma resposta (HU-10, critério 1)', async () => {
    const { user } = await openHome()
    await user.type(screen.getByRole('searchbox', { name: /buscar publicações/i }), 'importar{enter}')
    expect(await screen.findByRole('link', { name: /quando devo usar o synchrodfe/i })).toBeInTheDocument()
  })

  it('sem resultados: mensagem, "Fazer uma pergunta com este termo" e "Limpar busca" (HU-10, critério 4)', async () => {
    const { user, router } = await openHome()
    await user.type(screen.getByRole('searchbox', { name: /buscar publicações/i }), 'xyzzy{enter}')
    expect(await screen.findByText(/nenhum resultado para 'xyzzy'/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Fazer uma pergunta com este termo' })).toHaveAttribute('href', '/publicar/pergunta?titulo=xyzzy')
    await user.click(screen.getByRole('button', { name: 'Limpar busca' }))
    await waitFor(() => expect(currentItems().length).toBeGreaterThan(0))
    expect(router.state.location.search).toBe('')
  })

  it('guarda busca, tipo e tag na URL para compartilhar (2.4 B1)', async () => {
    const { router, user } = await openHome()
    await user.type(screen.getByRole('searchbox', { name: /buscar publicações/i }), 'certificado{enter}')
    await screen.findByText(/resultados? para 'certificado'/)
    expect(router.state.location.search).toContain('q=certificado')
  })
})

describe('B1 início: filtros (HU-12)', () => {
  it('clicar numa tag filtra e mostra o filtro removível', async () => {
    const { user, router } = await openHome()
    const first = await screen.findByRole('link', { name: /resumir chamados/i })
    await user.click(within(first.closest('li') as HTMLElement).getByRole('link', { name: '#Synchro4me' }))
    expect(router.state.location.search).toBe('?tag=synchro4me')
    await waitFor(() => expect(currentItems()).toHaveLength(2))
    await user.click(screen.getByRole('button', { name: 'Remover filtro #Synchro4me' }))
    await waitFor(() => expect(currentItems()).not.toHaveLength(2))
  })

  it('a tag na URL ignora maiúsculas e minúsculas e a tag aparece com a caixa original', async () => {
    renderApp({ route: '/?tag=SYNCHRO4ME' })
    expect(await screen.findByRole('button', { name: 'Remover filtro #Synchro4me' })).toBeInTheDocument()
    await waitFor(() => expect(currentItems()).toHaveLength(2))
  })

  it('os filtros mostram só as seis tags de exemplo, com a caixa original', async () => {
    await openHome()
    await screen.findByRole('button', { name: '#IA' })
    const pills = screen.getAllByRole('button').map((b) => b.textContent ?? '').filter((t) => t.startsWith('#'))
    expect([...pills].sort()).toEqual(['#Corporativo', '#ETA', '#IA', '#Synchro4me', '#SynchroDFE', '#SynchroTDF'])
  })

  it('filtra por tipo', async () => {
    const { user } = await openHome()
    await user.click(await screen.findByRole('radio', { name: 'Posts' }))
    expect(await screen.findByRole('link', { name: /guia de uso do synchro4me/i })).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole('link', { name: /quando devo usar o synchrodfe/i })).not.toBeInTheDocument())
  })

  it('tag sem publicações visíveis: mensagem e "Ver todas as publicações" (HU-12, critério 2)', async () => {
    const { user } = renderApp({ route: '/?tag=inexistente' })
    expect(await screen.findByText('Nenhuma publicação com a tag #inexistente.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Ver todas as publicações' }))
    await waitFor(() => expect(currentItems().length).toBeGreaterThan(0))
  })
})

describe('B1 início: estados', () => {
  it('fórum sem publicações: convida a publicar (HU-06, critério 3)', async () => {
    const seed = createSeed()
    seed.posts = []
    await openHome({ seed })
    expect(await screen.findByRole('heading', { name: 'Ainda não há publicações' })).toBeInTheDocument()
    expect(screen.getByText('Seja a primeira pessoa a publicar um post ou a fazer uma pergunta.')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Criar um post' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Fazer uma pergunta' }).length).toBeGreaterThan(0)
  })

  it('mostra esqueletos enquanto carrega', async () => {
    renderApp({ route: '/', overrides: { listPosts: () => new Promise(() => {}) } })
    expect(await screen.findByRole('status', { name: 'Carregando...' })).toBeInTheDocument()
  })

  it('erro de carregamento: mensagem e "Tentar de novo" mantendo os filtros', async () => {
    const real = renderApp({ route: '/?tag=ia' })
    real.unmount()
    const listPosts = vi
      .fn()
      .mockRejectedValueOnce(new ApiError(500, 'internal_error', 'Erro.'))
      .mockImplementation(real.api.listPosts)
    const { user } = renderApp({ route: '/?tag=ia', overrides: { listPosts } })
    expect(await screen.findByText('Não foi possível carregar as publicações.')).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Remover filtro #IA' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }))
    expect(await listItems()).not.toHaveLength(0)
  })

  it('mostra a faixa de sem conexão', async () => {
    await openHome()
    const original = Object.getOwnPropertyDescriptor(Navigator.prototype, 'onLine')
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false })
    window.dispatchEvent(new Event('offline'))
    expect(await screen.findByText(/você está sem conexão/i)).toBeInTheDocument()
    if (original) Object.defineProperty(Navigator.prototype, 'onLine', original)
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true })
  })
})
