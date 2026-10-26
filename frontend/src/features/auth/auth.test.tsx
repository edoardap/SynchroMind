import { screen, waitFor, within } from '@testing-library/react'
import { ApiError } from '../../api'
import { SAMPLE_VALID_TOKEN } from '../../api/memory/memoryApi'
import { renderApp } from '../../test/render'

describe('acesso: sem sessão', () => {
  it('manda quem não tem sessão para Entrar (RNF-01)', async () => {
    renderApp({ route: '/', profile: 'anonymous' })
    expect(await screen.findByRole('heading', { name: 'Entrar' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /fazer uma pergunta/i })).not.toBeInTheDocument()
  })

  it('bloqueia conta sem e-mail confirmado (HU-02, critério 2)', async () => {
    renderApp({ route: '/', profile: 'unconfirmed' })
    expect(await screen.findByText(/falta confirmar o seu e-mail/i)).toBeInTheDocument()
    expect(screen.getByText('camila.rocha@empresa.com.br')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enviar novo link/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /o que você precisa resolver/i })).not.toBeInTheDocument()
  })
})

describe('A1 cadastro', () => {
  async function open() {
    const utils = renderApp({ route: '/cadastro', profile: 'anonymous' })
    await screen.findByRole('heading', { name: 'Criar conta' })
    await screen.findByText(/guardamos só o seu nome/i)
    return utils
  }

  it('mostra o aviso de privacidade (HU-03, critério 1)', async () => {
    await open()
    expect(screen.getByText(/seus dados/i)).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /li e entendi/i })).not.toBeChecked()
  })

  it('diz quais campos faltam e não envia (HU-01, critério 4)', async () => {
    const { user } = await open()
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))
    const summary = await screen.findByRole('alert')
    expect(within(summary).getByText('Informe o seu nome.')).toBeInTheDocument()
    expect(within(summary).getByText('Informe o seu e-mail.')).toBeInTheDocument()
    expect(screen.getByLabelText('Nome')).toHaveFocus()
    expect(screen.getByLabelText('Nome')).toBeInvalid()
  })

  it('recusa e-mail de outro domínio com o domínio aceito na mensagem (HU-01, critério 2)', async () => {
    const { user } = await open()
    await user.type(screen.getByLabelText('Nome'), 'Ana Lima')
    await user.type(screen.getByLabelText('E-mail da empresa'), 'ana@gmail.com')
    await user.click(screen.getByRole('checkbox', { name: /li e entendi/i }))
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))
    expect(await screen.findAllByText(/só e-mails da empresa são aceitos.*@empresa\.com\.br/i)).not.toHaveLength(0)
  })

  it('só conclui com o aviso reconhecido e o botão continua ativo (HU-03, critério 2)', async () => {
    const { user } = await open()
    await user.type(screen.getByLabelText('Nome'), 'Ana Lima')
    await user.type(screen.getByLabelText('E-mail da empresa'), 'ana@empresa.com.br')
    const button = screen.getByRole('button', { name: 'Criar conta' })
    expect(button).toBeEnabled()
    await user.click(button)
    expect(await screen.findAllByText('Para criar a conta, marque que leu o aviso.')).not.toHaveLength(0)
    expect(screen.queryByRole('heading', { name: /confirme o seu e-mail/i })).not.toBeInTheDocument()
  })

  it('avisa que a conta já existe, com link para entrar (HU-01, critério 3)', async () => {
    const { user } = await open()
    await user.type(screen.getByLabelText('Nome'), 'Marina')
    await user.type(screen.getByLabelText('E-mail da empresa'), 'marina.souza@empresa.com.br')
    await user.click(screen.getByRole('checkbox', { name: /li e entendi/i }))
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))
    expect((await screen.findAllByText('Já existe uma conta com esse e-mail.')).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /entrar/i }).length).toBeGreaterThan(0)
  })

  it('cria a conta e vai para "Confirme o seu e-mail" (HU-01, critério 1)', async () => {
    const { user } = await open()
    await user.type(screen.getByLabelText('Nome'), 'Ana Lima')
    await user.type(screen.getByLabelText('E-mail da empresa'), 'ana.lima@empresa.com.br')
    await user.click(screen.getByRole('checkbox', { name: /li e entendi/i }))
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))
    expect(await screen.findByRole('heading', { name: /confirme o seu e-mail/i })).toBeInTheDocument()
    expect(screen.getByText('ana.lima@empresa.com.br')).toBeInTheDocument()
  })

  it('mantém os dados e oferece "Tentar de novo" se o servidor falhar', async () => {
    const createUser = vi
      .fn()
      .mockRejectedValueOnce(new ApiError(500, 'internal_error', 'Erro.'))
      .mockResolvedValueOnce(undefined)
    const { user } = renderApp({ route: '/cadastro', profile: 'anonymous', overrides: { createUser } })
    await screen.findByText(/guardamos só o seu nome/i)
    await user.type(screen.getByLabelText('Nome'), 'Ana Lima')
    await user.type(screen.getByLabelText('E-mail da empresa'), 'ana.lima@empresa.com.br')
    await user.click(screen.getByRole('checkbox', { name: /li e entendi/i }))
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))
    expect(await screen.findByText(/não foi possível criar a conta agora/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Nome')).toHaveValue('Ana Lima')
    await user.click(screen.getByRole('button', { name: /tentar de novo/i }))
    expect(await screen.findByRole('heading', { name: /confirme o seu e-mail/i })).toBeInTheDocument()
  })
})

describe('A2 confirme o seu e-mail', () => {
  it('sem e-mail na navegação, volta ao cadastro', async () => {
    renderApp({ route: '/verifique-seu-email', profile: 'anonymous' })
    expect(await screen.findByRole('heading', { name: 'Criar conta' })).toBeInTheDocument()
  })

  it('depois do cadastro, "Enviar novo link" confirma o reenvio', async () => {
    const requestLink = vi.fn().mockResolvedValue(undefined)
    const { user } = renderApp({ route: '/cadastro', profile: 'anonymous', overrides: { requestLink } })
    await screen.findByText(/guardamos só o seu nome/i)
    await user.type(screen.getByLabelText('Nome'), 'Ana Lima')
    await user.type(screen.getByLabelText('E-mail da empresa'), 'ana.lima@empresa.com.br')
    await user.click(screen.getByRole('checkbox', { name: /li e entendi/i }))
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))
    await screen.findByRole('heading', { name: /confirme o seu e-mail/i })
    await user.click(screen.getByRole('button', { name: /enviar novo link/i }))
    expect(await screen.findByText('Link enviado de novo.')).toBeInTheDocument()
    expect(requestLink).toHaveBeenCalledWith('ana.lima@empresa.com.br')
    expect(screen.getByRole('button', { name: /enviar novo link \(em \d+ s\)/i })).toBeDisabled()
  })
})

describe('A3 link de confirmação', () => {
  it('confirma o e-mail e libera o fórum (HU-02, critério 1)', async () => {
    const { user } = renderApp({ route: `/confirmar#token=${SAMPLE_VALID_TOKEN}`, profile: 'anonymous' })
    expect(await screen.findByRole('heading', { name: /e-mail confirmado/i })).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: /ir para o fórum/i }))
    expect(await screen.findByRole('heading', { name: /o que você precisa resolver/i })).toBeInTheDocument()
  })

  it('explica link expirado ou já usado e oferece novo link (HU-02, critério 3)', async () => {
    renderApp({ route: '/confirmar#token=velho', profile: 'anonymous' })
    expect(await screen.findByText(/este link não vale mais/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /enviar novo link/i })).toHaveAttribute('href', '/entrar')
  })

  it('mostra erro de rede com orientação', async () => {
    renderApp({
      route: `/confirmar#token=${SAMPLE_VALID_TOKEN}`,
      profile: 'anonymous',
      overrides: { verifyLink: () => Promise.reject(new TypeError('Failed to fetch')) },
    })
    expect(await screen.findByText(/não conseguimos confirmar agora/i)).toBeInTheDocument()
  })
})

describe('A5 entrar', () => {
  it('responde igual para qualquer e-mail, sem revelar quem tem conta', async () => {
    const { user } = renderApp({ route: '/entrar', profile: 'anonymous' })
    await screen.findByRole('heading', { name: 'Entrar' })
    await user.type(screen.getByLabelText('E-mail da empresa'), 'ninguem@empresa.com.br')
    await user.click(screen.getByRole('button', { name: 'Enviar link de acesso' }))
    expect(await screen.findByText(/se existir uma conta com esse e-mail, enviamos um link de acesso/i)).toBeInTheDocument()
  })

  it('pede o e-mail antes de enviar', async () => {
    const { user } = renderApp({ route: '/entrar', profile: 'anonymous' })
    await screen.findByRole('heading', { name: 'Entrar' })
    await user.click(screen.getByRole('button', { name: 'Enviar link de acesso' }))
    expect(await screen.findAllByText('Informe o seu e-mail.')).not.toHaveLength(0)
  })

  it('explica que a sessão acabou quando cai no meio do uso', async () => {
    const getMe = vi
      .fn()
      .mockResolvedValueOnce({
        id: 'u-marina', name: 'Marina Souza', email: 'marina.souza@empresa.com.br', role: 'user',
        email_confirmed_at: '2026-01-01T00:00:00Z', teams: [],
      })
    const listPosts = vi.fn().mockRejectedValue(new ApiError(401, 'unauthenticated', 'Entre para continuar.'))
    renderApp({ route: '/', overrides: { getMe, listPosts } })
    expect(await screen.findByText('Sua sessão acabou. Entre de novo para continuar.')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument())
  })
})
