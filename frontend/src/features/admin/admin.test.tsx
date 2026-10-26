import { screen, waitFor, within } from '@testing-library/react'
import { ApiError } from '../../api'
import { createSeed } from '../../api/memory/seed'
import { renderApp } from '../../test/render'

async function openAdmin(route = '/admin', options: Parameters<typeof renderApp>[0] = {}) {
  const utils = renderApp({ route, profile: 'admin', ...options })
  await screen.findByRole('heading', { level: 1, name: 'Administração' })
  return utils
}

describe('C1 sem permissão (HU-05 critério 3, HU-16 critério 3, HU-17 critério 2)', () => {
  it('usuário comum vê "Sem permissão" na rota de administração', async () => {
    renderApp({ route: '/admin' })
    expect(await screen.findByRole('heading', { name: 'Você não tem acesso a esta página' })).toBeInTheDocument()
    expect(screen.getByText('Esta área é só para administradores.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar ao início' })).toBeInTheDocument()
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
  })

  it('usuário comum não vê o item "Administração" no menu; admin vê', async () => {
    const first = renderApp({ route: '/' })
    await screen.findByRole('heading', { name: /o que você precisa resolver/i })
    expect(screen.queryByRole('link', { name: 'Administração' })).not.toBeInTheDocument()
    first.unmount()
    renderApp({ route: '/', profile: 'admin' })
    expect(await screen.findByRole('link', { name: 'Administração' })).toBeInTheDocument()
  })

  it('mesmo as outras abas dão "Sem permissão" para usuário comum', async () => {
    renderApp({ route: '/admin/exclusoes' })
    expect(await screen.findByRole('heading', { name: 'Você não tem acesso a esta página' })).toBeInTheDocument()
  })
})

describe('C1 abas e navegação por teclado', () => {
  it('mostra as quatro abas com o número de pendências em texto', async () => {
    await openAdmin()
    expect(await screen.findByRole('tab', { name: 'Denúncias (2)' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Ocultos' })).toBeInTheDocument()
    expect(await screen.findByRole('tab', { name: 'Pedidos de exclusão (1)' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Administradores' })).toBeInTheDocument()
  })

  it('setas trocam de aba e levam o foco', async () => {
    const { user, router } = await openAdmin()
    await user.click(screen.getByRole('tab', { name: /denúncias/i }))
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Ocultos' })).toHaveFocus()
    expect(router.state.location.pathname).toBe('/admin/ocultos')
    expect(screen.getByRole('tab', { name: 'Ocultos' })).toHaveAttribute('aria-selected', 'true')
  })
})

describe('aba Denúncias (HU-16)', () => {
  it('lista as abertas com tipo, motivo e ações', async () => {
    await openAdmin()
    const list = await screen.findByRole('list', { name: 'Denúncias' })
    const items = within(list).getAllByRole('listitem')
    expect(items).toHaveLength(2)
    const first = within(list).getByText(/a data de fechamento citada já mudou/i).closest('li') as HTMLElement
    expect(within(first).getByText('Informação errada ou desatualizada')).toBeInTheDocument()
    expect(within(first).getByRole('link', { name: /ver conteúdo/i })).toHaveAttribute('href', '/posts/p-1')
    expect(within(first).getByRole('button', { name: /ocultar/i })).toBeInTheDocument()
    expect(within(first).getByRole('button', { name: /dispensar denúncia/i })).toBeInTheDocument()
  })

  it('dispensar tira da lista de abertas e vai para resolvidas', async () => {
    const { user } = await openAdmin()
    const list = await screen.findByRole('list', { name: 'Denúncias' })
    const first = within(list).getByText(/a data de fechamento citada já mudou/i).closest('li') as HTMLElement
    await user.click(within(first).getByRole('button', { name: /dispensar denúncia/i }))
    await waitFor(() => expect(screen.queryByText(/a data de fechamento citada já mudou/i)).not.toBeInTheDocument())
    expect(await screen.findByRole('tab', { name: 'Denúncias (1)' })).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: 'Resolvidas' }))
    expect(await screen.findByText(/dispensada por helena duarte/i)).toBeInTheDocument()
  })

  it('ocultar pela denúncia pede confirmação, some das abertas e aparece como "Ocultado por"', async () => {
    const { user } = await openAdmin()
    const list = await screen.findByRole('list', { name: 'Denúncias' })
    const row = within(list).getByText(/a data de fechamento citada já mudou/i).closest('li') as HTMLElement
    await user.click(within(row).getByRole('button', { name: /^ocultar/i }))
    const dialog = await screen.findByRole('dialog', { name: 'Ocultar este conteúdo?' })
    await user.click(within(dialog).getByRole('button', { name: 'Ocultar' }))
    await waitFor(() => expect(screen.queryByText(/a data de fechamento citada já mudou/i)).not.toBeInTheDocument())
    await user.click(screen.getByRole('radio', { name: 'Resolvidas' }))
    expect(await screen.findAllByText(/ocultado por helena duarte em/i)).not.toHaveLength(0)
  })

  it('vazio: "Nenhuma denúncia aberta."', async () => {
    const seed = createSeed()
    seed.reports = seed.reports.filter((r) => r.status !== 'open')
    await openAdmin('/admin', { seed })
    expect(await screen.findByText('Nenhuma denúncia aberta.')).toBeInTheDocument()
  })

  it('erro de carregamento com "Tentar de novo"', async () => {
    const real = renderApp({ route: '/admin', profile: 'admin' })
    real.unmount()
    const listReports = vi.fn().mockRejectedValueOnce(new ApiError(500, 'x', 'x')).mockImplementation(real.api.listReports)
    const { user } = await openAdmin('/admin', { overrides: { listReports } })
    expect(await screen.findByText('Não foi possível carregar as denúncias.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }))
    expect(await screen.findByRole('list', { name: 'Denúncias' })).toBeInTheDocument()
  })

  it('mostra esqueletos enquanto carrega', async () => {
    renderApp({ route: '/admin', profile: 'admin', overrides: { listReports: () => new Promise(() => {}) } })
    expect(await screen.findByRole('status', { name: 'Carregando...' })).toBeInTheDocument()
  })
})

describe('aba Ocultos (HU-15)', () => {
  it('lista os ocultos com "Ocultado por Nome em data" e restaura, com "Desfazer"', async () => {
    const { user } = await openAdmin('/admin/ocultos')
    const list = await screen.findByRole('list', { name: 'Conteúdos ocultos' })
    const row = within(list).getByText(/senha de acesso colada/i).closest('li') as HTMLElement
    expect(within(row).getByText(/ocultado por helena duarte em \d{2}\/\d{2}/i)).toBeInTheDocument()
    expect(within(row).getByText(/Rafael Nunes/)).toBeInTheDocument()
    await user.click(within(row).getByRole('button', { name: /^restaurar/i }))
    expect(await screen.findByText('Restaurado.')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText(/senha de acesso colada/i)).not.toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Desfazer' }))
    expect(await screen.findByText(/senha de acesso colada/i)).toBeInTheDocument()
  })

  it('vazio: "Nenhum conteúdo oculto."', async () => {
    const seed = createSeed()
    for (const p of seed.posts) p.hidden = null
    await openAdmin('/admin/ocultos', { seed })
    expect(await screen.findByText('Nenhum conteúdo oculto.')).toBeInTheDocument()
  })
})

describe('aba Pedidos de exclusão (HU-05)', () => {
  it('mostra o pedido pendente com nome, e-mail e data; confirma e conclui sem dados pessoais', async () => {
    const { user } = await openAdmin('/admin/exclusoes')
    const list = await screen.findByRole('list', { name: 'Pedidos de exclusão' })
    const row = within(list).getByText('Tiago Barros').closest('li') as HTMLElement
    expect(within(row).getByText('tiago.barros@empresa.com.br')).toBeInTheDocument()
    await user.click(within(row).getByRole('button', { name: /^excluir conta/i }))
    const dialog = await screen.findByRole('dialog', { name: 'Excluir a conta de Tiago Barros?' })
    expect(within(dialog).getByText(/esta ação não pode ser desfeita/i)).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Cancelar' })).toHaveFocus()
    await user.click(within(dialog).getByRole('button', { name: 'Excluir conta' }))
    expect(await screen.findByText('Nenhum pedido pendente.')).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: 'Concluídos' }))
    const done = await screen.findAllByText('Conta excluída')
    expect(done.length).toBe(2)
    expect(screen.queryByText('Tiago Barros')).not.toBeInTheDocument()
  })

  it('depois da exclusão, o conteúdo da pessoa fica sem o nome (HU-05, critério 2)', async () => {
    const { user, router } = await openAdmin('/admin/exclusoes')
    const row = (await screen.findByText('Tiago Barros')).closest('li') as HTMLElement
    await user.click(within(row).getByRole('button', { name: /^excluir conta/i }))
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Excluir conta' }))
    await screen.findByText('Nenhum pedido pendente.')
    await router.navigate('/posts/p-9')
    await screen.findByRole('heading', { level: 1, name: /resumir chamados/i })
    expect(screen.getAllByText('Conta excluída').length).toBeGreaterThan(0)
    expect(screen.queryByText('Tiago Barros')).not.toBeInTheDocument()
  })

  it('avisa quando a pessoa também é administradora', async () => {
    const seed = createSeed()
    seed.deletions.push({ id: 'd-3', userId: 'u-paulo', status: 'pending', requestedAt: new Date().toISOString(), completedAt: null })
    await openAdmin('/admin/exclusoes', { seed })
    expect(await screen.findByText('Esta pessoa é administradora.')).toBeInTheDocument()
  })

  it('explica a recusa quando é o último administrador', async () => {
    const approveDeletion = vi.fn().mockRejectedValue(new ApiError(409, 'last_admin', 'x'))
    const { user } = await openAdmin('/admin/exclusoes', { overrides: { approveDeletion } })
    const row = (await screen.findByText('Tiago Barros')).closest('li') as HTMLElement
    await user.click(within(row).getByRole('button', { name: /^excluir conta/i }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Excluir conta' }))
    expect(await within(dialog).findByText(/última pessoa administradora/i)).toBeInTheDocument()
  })
})

describe('aba Administradores (HU-17)', () => {
  it('lista os admins com e-mail e "Admin desde" (critério 3)', async () => {
    await openAdmin('/admin/administradores')
    const list = await screen.findByRole('list', { name: 'Administradores' })
    expect(within(list).getByText('Helena Duarte')).toBeInTheDocument()
    expect(within(list).getByText('paulo.mendes@empresa.com.br')).toBeInTheDocument()
    expect(within(list).getAllByText(/admin desde \d{2}\/\d{2}\/\d{4}/i)).toHaveLength(2)
  })

  it('promove alguém: busca, confirmação com o que muda, e a pessoa entra na lista (critério 1)', async () => {
    const { user } = await openAdmin('/admin/administradores')
    await user.click(await screen.findByRole('button', { name: 'Promover alguém a admin' }))
    const dialog = await screen.findByRole('dialog', { name: 'Promover alguém a administrador' })
    await user.type(within(dialog).getByRole('combobox', { name: 'Nome ou e-mail' }), 'bea')
    await user.click(await screen.findByRole('option', { name: /beatriz alves/i }))
    expect(within(dialog).getByText(/beatriz alves passará a poder ocultar e restaurar conteúdo, ver denúncias, tratar pedidos de exclusão e promover outras pessoas/i)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Promover' }))
    expect(await screen.findByText('Beatriz Alves agora é administrador.')).toBeInTheDocument()
    const list = await screen.findByRole('list', { name: 'Administradores' })
    expect(await within(list).findByText('Beatriz Alves')).toBeInTheDocument()
  })

  it('busca sem resultado e pessoa que já é admin', async () => {
    const { user } = await openAdmin('/admin/administradores')
    await user.click(await screen.findByRole('button', { name: 'Promover alguém a admin' }))
    const dialog = await screen.findByRole('dialog')
    const field = within(dialog).getByRole('combobox', { name: 'Nome ou e-mail' })
    await user.type(field, 'zzzz')
    expect(await screen.findByText('Ninguém com esse nome ou e-mail.')).toBeInTheDocument()
    await user.clear(field)
    await user.type(field, 'paulo')
    await user.click(await screen.findByRole('option', { name: /paulo mendes/i }))
    expect(await within(dialog).findByText('Essa pessoa já é administradora.')).toBeInTheDocument()
  })

  it('exige escolher uma pessoa', async () => {
    const promoteUser = vi.fn()
    const { user } = await openAdmin('/admin/administradores', { overrides: { promoteUser } })
    await user.click(await screen.findByRole('button', { name: 'Promover alguém a admin' }))
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Promover' }))
    expect(await screen.findByText('Escolha uma pessoa.')).toBeInTheDocument()
    expect(promoteUser).not.toHaveBeenCalled()
  })
})
