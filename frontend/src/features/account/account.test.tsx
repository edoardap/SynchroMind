import { screen, waitFor, within } from '@testing-library/react'
import { ApiError } from '../../api'
import { createSeed } from '../../api/memory/seed'
import { renderApp } from '../../test/render'

describe('B9 minhas publicações', () => {
  it('lista o que a pessoa publicou, com o selo "Oculto" e a explicação nos ocultos (2.5)', async () => {
    renderApp({ route: '/minhas-publicacoes' })
    expect(await screen.findByRole('heading', { name: 'Minhas publicações' })).toBeInTheDocument()
    const list = await screen.findByRole('list', { name: /publicações/i })
    expect(within(list).getByRole('link', { name: /dados de clientes nos nossos testes/i })).toBeInTheDocument()
    expect(within(list).getByRole('link', { name: /importação de arquivos grandes/i })).toBeInTheDocument()
    const hidden = within(list).getByRole('link', { name: /dica de exemplo que a marina/i }).closest('li') as HTMLElement
    expect(within(hidden).getByText('Oculto')).toBeInTheDocument()
    expect(within(hidden).getByText('Só você e os administradores veem este conteúdo.')).toBeInTheDocument()
    expect(within(list).queryByRole('link', { name: /calendário de fechamento/i })).not.toBeInTheDocument()
  })

  it('vazio: convida a publicar', async () => {
    const seed = createSeed()
    seed.posts = seed.posts.filter((p) => p.authorId !== 'u-marina')
    renderApp({ route: '/minhas-publicacoes', seed })
    expect(await screen.findByText('Você ainda não publicou nada.')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Criar um post' }).length).toBeGreaterThan(0)
  })

  it('erro com "Tentar de novo"', async () => {
    const real = renderApp({ route: '/minhas-publicacoes' })
    real.unmount()
    const listPosts = vi.fn().mockRejectedValueOnce(new ApiError(500, 'x', 'x')).mockImplementation(real.api.listPosts)
    const { user } = renderApp({ route: '/minhas-publicacoes', overrides: { listPosts } })
    expect(await screen.findByText('Não foi possível carregar as publicações.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }))
    expect(await screen.findByRole('link', { name: /dados de clientes nos nossos testes/i })).toBeInTheDocument()
  })

  it('mostra esqueletos enquanto carrega', async () => {
    renderApp({ route: '/minhas-publicacoes', overrides: { listPosts: () => new Promise(() => {}) } })
    expect(await screen.findByRole('status', { name: 'Carregando...' })).toBeInTheDocument()
  })
})

describe('B10 minha conta e pedido de exclusão (HU-04)', () => {
  async function open(options: Parameters<typeof renderApp>[0] = {}) {
    const utils = renderApp({ route: '/conta', ...options })
    await screen.findByRole('heading', { name: 'Minha conta' })
    return utils
  }

  it('mostra nome e e-mail somente para leitura', async () => {
    await open()
    const main = within(screen.getByRole('main'))
    expect(await main.findByText('Marina Souza')).toBeInTheDocument()
    expect(main.getByText('marina.souza@empresa.com.br')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('explica o que acontece e exige a caixa de marcação antes de enviar (critério 1)', async () => {
    const requestDeletion = vi.fn()
    const { user } = await open({ overrides: { requestDeletion } })
    await user.click(await screen.findByRole('button', { name: 'Pedir exclusão da conta' }))
    const dialog = await screen.findByRole('dialog', { name: 'Pedir a exclusão da sua conta?' })
    expect(within(dialog).getByText(/o que você publicou continua no fórum/i)).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Cancelar' })).toHaveFocus()
    await user.click(within(dialog).getByRole('button', { name: 'Enviar pedido' }))
    expect(await within(dialog).findByText('Para enviar o pedido, marque que entendeu.')).toBeInTheDocument()
    expect(requestDeletion).not.toHaveBeenCalled()
  })

  it('envia o pedido e mostra "Pedido pendente" sem o botão (critério 2)', async () => {
    const { user } = await open()
    await user.click(await screen.findByRole('button', { name: 'Pedir exclusão da conta' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('checkbox', { name: /entendi que o que publiquei continua no fórum/i }))
    await user.click(within(dialog).getByRole('button', { name: 'Enviar pedido' }))
    expect(await screen.findByText('Pedido pendente')).toBeInTheDocument()
    expect(screen.getByText(/enviado em \d{2}\/\d{2}\/\d{4}\. os administradores ainda vão analisar/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Pedir exclusão da conta' })).not.toBeInTheDocument()
  })

  it('com pedido já pendente, abre mostrando o estado pendente', async () => {
    const seed = createSeed()
    seed.deletions.push({ id: 'd-9', userId: 'u-marina', status: 'pending', requestedAt: new Date().toISOString(), completedAt: null })
    await open({ seed })
    expect(await screen.findByText('Pedido pendente')).toBeInTheDocument()
  })

  it('avisa se o pedido já existe em outra aba (critério 3)', async () => {
    const requestDeletion = vi.fn().mockRejectedValue(new ApiError(409, 'deletion_already_requested', 'x'))
    const { user } = await open({ overrides: { requestDeletion } })
    await user.click(await screen.findByRole('button', { name: 'Pedir exclusão da conta' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('checkbox'))
    await user.click(within(dialog).getByRole('button', { name: 'Enviar pedido' }))
    expect(await within(dialog).findByText('Você já tem um pedido de exclusão pendente.')).toBeInTheDocument()
  })

  it('mostra erro de envio', async () => {
    const requestDeletion = vi.fn().mockRejectedValue(new ApiError(500, 'x', 'x'))
    const { user } = await open({ overrides: { requestDeletion } })
    await user.click(await screen.findByRole('button', { name: 'Pedir exclusão da conta' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('checkbox'))
    await user.click(within(dialog).getByRole('button', { name: 'Enviar pedido' }))
    expect(await within(dialog).findByText('Não foi possível enviar o pedido. Tente de novo.')).toBeInTheDocument()
  })

  it('o menu do avatar leva a Minha conta e a Minhas publicações e sai da sessão', async () => {
    const { user, router } = renderApp({ route: '/' })
    await user.click(await screen.findByRole('button', { name: 'Conta de Marina Souza' }))
    await user.click(screen.getByRole('menuitem', { name: 'Minha conta' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/conta'))
    await user.click(screen.getByRole('button', { name: 'Conta de Marina Souza' }))
    await user.click(screen.getByRole('menuitem', { name: 'Sair' }))
    expect(await screen.findByRole('heading', { name: 'Entrar' })).toBeInTheDocument()
  })
})
