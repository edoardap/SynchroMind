import { screen, waitFor, within } from '@testing-library/react'
import { renderApp } from '../test/render'

function mockMobile(matches: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches, media: query, addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {},
    onchange: null, dispatchEvent: () => false,
  }))
}

afterEach(() => vi.unstubAllGlobals())

describe('cabeçalho e navegação (desktop)', () => {
  it('traz o link "Pular para o conteúdo" como primeiro item e a marca com texto alternativo', async () => {
    renderApp()
    await screen.findByRole('heading', { name: /o que você precisa resolver/i })
    const links = screen.getAllByRole('link')
    expect(links[0]).toHaveAccessibleName('Pular para o conteúdo')
    expect(screen.getByRole('link', { name: 'SynchroMind, início' })).toBeInTheDocument()
  })

  it('mostra dois botões separados, "Fazer uma pergunta" e "Criar um post", e nenhum menu "Compartilhar"', async () => {
    renderApp()
    await screen.findByRole('heading', { name: /o que você precisa resolver/i })
    const header = within(screen.getByRole('banner'))
    const ask = header.getByRole('link', { name: 'Fazer uma pergunta' })
    const create = header.getByRole('link', { name: 'Criar um post' })
    expect(ask).toHaveAttribute('href', '/publicar/pergunta')
    expect(create).toHaveAttribute('href', '/publicar/post')
    expect(ask.className).not.toEqual(create.className) // hierarquia visual diferente: um primário, o outro de contorno
    expect(screen.queryByRole('button', { name: 'Compartilhar' })).not.toBeInTheDocument()
  })

  it('os dois botões chegam pelo teclado (Tab) e abrem com Enter', async () => {
    const { user, router } = renderApp()
    await screen.findByRole('heading', { name: /o que você precisa resolver/i })
    const header = within(screen.getByRole('banner'))
    header.getByRole('link', { name: 'Fazer uma pergunta' }).focus()
    await user.tab()
    expect(header.getByRole('link', { name: 'Criar um post' })).toHaveFocus()
    await user.keyboard('{Enter}')
    await waitFor(() => expect(router.state.location.pathname).toBe('/publicar/post'))
  })

  it('o menu da conta abre com o teclado e Esc devolve o foco ao botão', async () => {
    const { user } = renderApp()
    await screen.findByRole('heading', { name: /o que você precisa resolver/i })
    const trigger = screen.getByRole('button', { name: 'Conta de Marina Souza' })
    trigger.focus()
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('menuitem', { name: 'Minha conta' })).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('página inexistente mostra "Não encontramos esta página."', async () => {
    renderApp({ route: '/qualquer-coisa' })
    expect(await screen.findByRole('heading', { name: 'Não encontramos esta página.' })).toBeInTheDocument()
  })
})

describe('celular (360 px)', () => {
  it('mostra o botão "Publicar" com a folha de três opções e o menu com o botão de buscar', async () => {
    mockMobile(true)
    const { user } = renderApp()
    await screen.findByRole('heading', { name: /o que você precisa resolver/i })
    expect(screen.getByRole('button', { name: 'Ir para a busca' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Publicar' }))
    const sheet = await screen.findByRole('dialog', { name: 'Publicar' })
    expect(within(sheet).getByRole('link', { name: 'Fazer uma pergunta' })).toBeInTheDocument()
    expect(within(sheet).getByRole('link', { name: 'Criar um post' })).toHaveAttribute('href', '/publicar/post')
    expect(within(sheet).getAllByRole('link')).toHaveLength(2) // só as duas ações, separadas
  })

  it('filtros ficam atrás de "Filtrar" com a contagem de filtros ativos', async () => {
    mockMobile(true)
    const { user } = renderApp({ route: '/?tag=ia' })
    await user.click(await screen.findByRole('button', { name: 'Filtrar (1)' }))
    const sheet = await screen.findByRole('dialog', { name: 'Filtros' })
    expect(within(sheet).getByRole('radio', { name: 'Perguntas' })).toBeInTheDocument()
    await user.click(within(sheet).getByRole('button', { name: 'Limpar' }))
    expect(await screen.findByRole('button', { name: 'Filtrar' })).toBeInTheDocument()
  })

  it('o menu do celular lista Início, Minha conta, Minhas publicações e Sair', async () => {
    mockMobile(true)
    const { user } = renderApp()
    await user.click(await screen.findByRole('button', { name: 'Menu' }))
    const sheet = await screen.findByRole('dialog', { name: 'Menu' })
    for (const name of ['Início', 'Minha conta', 'Minhas publicações']) {
      expect(within(sheet).getByRole('link', { name })).toBeInTheDocument()
    }
    expect(within(sheet).getByRole('button', { name: 'Sair' })).toBeInTheDocument()
  })
})
