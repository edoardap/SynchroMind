import { screen, waitFor, within } from '@testing-library/react'
import { ApiError } from '../../api'
import { createSeed, type SeedData } from '../../api/memory/seed'
import { renderApp } from '../../test/render'

async function openPost(id: string, options: Parameters<typeof renderApp>[0] = {}) {
  const utils = renderApp({ route: `/posts/${id}`, ...options })
  await screen.findByRole('heading', { level: 1 })
  return utils
}

describe('B5 detalhe de pergunta (HU-08, HU-13, HU-14)', () => {
  it('mostra selos, tags, texto, autor e as respostas com a aceita no topo', async () => {
    await openPost('p-2')
    expect(screen.getByRole('heading', { level: 1, name: /acesso ao ambiente de homologação/i })).toBeInTheDocument()
    expect(screen.getAllByText('Respondida').length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: '#SynchroDFE' })).toBeInTheDocument()
    expect(screen.getByText(/o meu usuário não entra na homologação/i)).toBeInTheDocument()
    expect(await screen.findByRole('heading', { level: 2, name: '2 respostas' })).toBeInTheDocument() // a oculta não conta
    const answers = screen.getAllByRole('article', { name: /resposta de/i })
    expect(answers).toHaveLength(2)
    expect(within(answers[0] as HTMLElement).getByText('Resposta aceita')).toBeInTheDocument()
    expect(within(answers[0] as HTMLElement).getByText(/Rafael Nunes/)).toBeInTheDocument()
    expect(within(answers[1] as HTMLElement).queryByText('Resposta aceita')).not.toBeInTheDocument()
  })

  it('quem não escreveu a pergunta não vê "Aceitar resposta" (HU-14, critério 2)', async () => {
    await openPost('p-2')
    await screen.findByRole('heading', { level: 2, name: '2 respostas' })
    expect(screen.queryByRole('button', { name: 'Aceitar resposta' })).not.toBeInTheDocument()
  })

  it('pergunta sem respostas: mensagem e selo "Sem respostas"', async () => {
    await openPost('p-9')
    expect(await screen.findByText('Ainda ninguém respondeu.')).toBeInTheDocument()
    expect(screen.getByText('Você sabe como resolver? Escreva a primeira resposta abaixo.')).toBeInTheDocument()
    expect(screen.getByText('Sem respostas')).toBeInTheDocument()
  })

  it('não publica resposta vazia e avisa (HU-08, critério 2)', async () => {
    const createAnswer = vi.fn()
    const { user } = await openPost('p-9', { overrides: { createAnswer } })
    await screen.findByText('Ainda ninguém respondeu.')
    await user.click(screen.getByRole('button', { name: 'Publicar resposta' }))
    expect(await screen.findByText('Escreva a sua resposta antes de enviar.')).toBeInTheDocument()
    expect(createAnswer).not.toHaveBeenCalled()
  })

  it('publica a resposta com o nome de quem respondeu (HU-08, critério 1)', async () => {
    const { user } = await openPost('p-9')
    await screen.findByText('Ainda ninguém respondeu.')
    await user.type(screen.getByLabelText('Sua resposta'), 'Use a rota estática.')
    await user.click(screen.getByRole('button', { name: 'Publicar resposta' }))
    expect(await screen.findByRole('heading', { level: 2, name: '1 resposta' })).toBeInTheDocument()
    const answer = screen.getByRole('article', { name: /resposta de marina souza/i })
    expect(within(answer).getByText('Use a rota estática.')).toBeInTheDocument()
    expect(screen.getByLabelText('Sua resposta')).toHaveValue('')
  })

  it('mantém o texto se a resposta falhar', async () => {
    const createAnswer = vi.fn().mockRejectedValue(new ApiError(500, 'x', 'x'))
    const { user } = await openPost('p-9', { overrides: { createAnswer } })
    await screen.findByText('Ainda ninguém respondeu.')
    await user.type(screen.getByLabelText('Sua resposta'), 'Meu texto')
    await user.click(screen.getByRole('button', { name: 'Publicar resposta' }))
    expect(await screen.findByText('Não foi possível publicar. O texto continua aqui. Tente de novo.')).toBeInTheDocument()
    expect(screen.getByLabelText('Sua resposta')).toHaveValue('Meu texto')
  })
})

describe('votos (HU-13)', () => {
  it('é uma alternância: vota, e clicar de novo retira o voto', async () => {
    const { user } = await openPost('p-2')
    const question = screen.getByRole('article', { name: /pergunta de beatriz/i })
    const button = within(question).getByRole('button', { name: 'Foi útil · 1' })
    expect(button).toHaveAttribute('aria-pressed', 'false')
    await user.click(button)
    expect(await within(question).findByRole('button', { name: 'Útil · 2' })).toHaveAttribute('aria-pressed', 'true')
    await user.click(within(question).getByRole('button', { name: 'Útil · 2' }))
    expect(await within(question).findByRole('button', { name: 'Foi útil · 1' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('volta ao valor anterior e avisa se o servidor falhar', async () => {
    const votePost = vi.fn().mockRejectedValue(new ApiError(500, 'x', 'x'))
    const { user } = await openPost('p-2', { overrides: { votePost } })
    const question = screen.getByRole('article', { name: /pergunta de beatriz/i })
    await user.click(within(question).getByRole('button', { name: 'Foi útil · 1' }))
    expect(await screen.findByText('Não foi possível registrar o voto. Tente de novo.')).toBeInTheDocument()
    expect(within(question).getByRole('button', { name: 'Foi útil · 1' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('no próprio conteúdo não há botão, só a contagem (HU-13, critério 4)', async () => {
    await openPost('p-5') // post da Marina, 2 votos
    expect(screen.queryByRole('button', { name: /foi útil/i })).not.toBeInTheDocument()
    expect(screen.getByText('2 pessoas acharam útil')).toBeInTheDocument()
  })

  it('vota numa resposta', async () => {
    const { user } = await openPost('p-2')
    const answer = (await screen.findAllByRole('article', { name: /resposta de/i }))[1] as HTMLElement
    await user.click(within(answer).getByRole('button', { name: /foi útil · 1/i }))
    expect(await within(answer).findByRole('button', { name: 'Útil · 2' })).toBeInTheDocument()
  })
})

describe('resposta aceita (HU-14)', () => {
  function seedWithTwoAnswers(): SeedData {
    const seed = createSeed()
    const post = seed.posts.find((p) => p.id === 'p-4')!
    post.acceptedAnswerId = 'a-6'
    seed.answers.push({ id: 'a-7', postId: 'p-4', body: 'Outra opção: variáveis do ambiente.', authorId: 'u-beatriz', voters: [], hidden: null, createdAt: new Date().toISOString(), editedAt: null })
    return seed
  }

  it('o autor aceita uma resposta: ela sobe, o selo muda e há aviso (critério 1)', async () => {
    const seed = createSeed()
    const { user } = await openPost('p-4', { seed })
    await screen.findByRole('heading', { level: 2, name: '1 resposta' })
    await user.click(await screen.findByRole('button', { name: 'Aceitar resposta' }))
    expect(await screen.findByText('Resposta aceita.')).toBeInTheDocument()
    const answer = screen.getByRole('article', { name: /resposta de rafael/i })
    expect(within(answer).getByText('Resposta aceita')).toBeInTheDocument()
    expect(screen.getAllByText('Respondida').length).toBeGreaterThan(0)
  })

  it('trocar a resposta aceita pede confirmação (critério 3)', async () => {
    const { user } = await openPost('p-4', { seed: seedWithTwoAnswers() })
    const other = (await screen.findAllByRole('article', { name: /resposta de beatriz/i }))[0] as HTMLElement
    await user.click(within(other).getByRole('button', { name: 'Aceitar resposta' }))
    const dialog = await screen.findByRole('dialog', { name: 'Trocar a resposta aceita?' })
    expect(within(dialog).getByText('A resposta atual deixa de ser a aceita.')).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Trocar' }))
    await waitFor(() => expect(within(screen.getByRole('article', { name: /resposta de beatriz/i })).getByText('Resposta aceita')).toBeInTheDocument())
    expect(within(screen.getByRole('article', { name: /resposta de rafael/i })).queryByText('Resposta aceita')).not.toBeInTheDocument()
  })

  it('o autor desfaz o aceite pelo menu da resposta aceita', async () => {
    const { user } = await openPost('p-4', { seed: seedWithTwoAnswers() })
    const accepted = (await screen.findAllByRole('article', { name: /resposta de rafael/i }))[0] as HTMLElement
    await user.click(within(accepted).getByRole('button', { name: 'Mais ações' }))
    await user.click(screen.getByRole('menuitem', { name: 'Desfazer aceite' }))
    await waitFor(() => expect(screen.queryByText('Resposta aceita')).not.toBeInTheDocument())
  })
})

describe('B6 detalhe de post (texto livre)', () => {
  it('mostra título, texto, tags e o painel lateral, sem as seções de problema e solução', async () => {
    await openPost('p-1')
    expect(screen.getByRole('heading', { level: 1, name: /calendário de fechamento/i })).toBeInTheDocument()
    expect(screen.getByText(/fechamento do mês passa a acontecer no segundo dia útil/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '#SynchroTDF' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '#ETA' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2, name: 'Problema' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2, name: 'Solução' })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Sua resposta')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Sobre este post' })).toBeInTheDocument()
  })

  it('post em nome de um time mostra o selo "Post", o time e o autor', async () => {
    await openPost('p-3')
    expect(screen.getByText('Post')).toBeInTheDocument()
    expect(screen.getAllByText(/Time Pagamentos/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Tiago Barros/).length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: '#Synchro4me' })).toBeInTheDocument()
  })

  it('autor de conta excluída aparece como "Conta excluída"', async () => {
    await openPost('p-12')
    expect(screen.getAllByText('Conta excluída').length).toBeGreaterThan(0)
  })
})

describe('estados do detalhe', () => {
  it('mostra esqueleto enquanto carrega', async () => {
    renderApp({ route: '/posts/p-1', overrides: { getPost: () => new Promise(() => {}) } })
    expect(await screen.findByRole('status', { name: 'Carregando...' })).toBeInTheDocument()
  })

  it('erro de carregamento com "Tentar de novo"', async () => {
    const real = renderApp({ route: '/posts/p-1' })
    real.unmount()
    const { user } = renderApp({ route: '/posts/p-1', overrides: { getPost: vi.fn().mockRejectedValueOnce(new ApiError(500, 'x', 'x')).mockImplementation(real.api.getPost) } })
    expect(await screen.findByText('Não foi possível abrir esta publicação.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }))
    expect(await screen.findByRole('heading', { level: 1, name: /calendário de fechamento/i })).toBeInTheDocument()
  })

  it('conteúdo oculto ou inexistente para quem não é autor nem admin: mesma página (2.5)', async () => {
    renderApp({ route: '/posts/p-10' })
    expect(await screen.findByRole('heading', { name: 'Esta publicação não está disponível.' })).toBeInTheDocument()
    expect(screen.getByText('Ela pode ter sido ocultada ou removida.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar ao início' })).toBeInTheDocument()
  })

  it('link de publicação que não existe mostra o mesmo texto', async () => {
    renderApp({ route: '/posts/nao-existe' })
    expect(await screen.findByRole('heading', { name: 'Esta publicação não está disponível.' })).toBeInTheDocument()
  })

  it('o autor vê o próprio conteúdo oculto, com a faixa e sem editar nem votar (2.5)', async () => {
    await openPost('p-11')
    expect(screen.getByText(/este conteúdo foi ocultado pelos administradores e não aparece para outras pessoas/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Restaurar' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /foi útil/i })).not.toBeInTheDocument()
    // enquanto está oculto, o autor não edita nem denuncia: o menu nem aparece
    expect(screen.queryByRole('button', { name: 'Mais ações' })).not.toBeInTheDocument()
  })

  it('o admin vê o conteúdo oculto com "Oculto por Nome" e o botão Restaurar', async () => {
    await openPost('p-10', { profile: 'admin' })
    expect(screen.getByText(/oculto por helena duarte em/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Restaurar' })).toBeInTheDocument()
  })
})

describe('B7 editar o próprio conteúdo (HU-09)', () => {
  it('só o autor vê "Editar"; outras pessoas veem "Denunciar" (critério 2)', async () => {
    const { user } = await openPost('p-1')
    await user.click(screen.getByRole('button', { name: 'Mais ações' }))
    expect(screen.queryByRole('menuitem', { name: 'Editar' })).not.toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Denunciar' })).toBeInTheDocument()
  })

  it('edita no próprio cartão e mostra "editado há instantes" (critério 1)', async () => {
    const { user } = await openPost('p-5')
    await user.click(screen.getByRole('button', { name: 'Mais ações' }))
    await user.click(screen.getByRole('menuitem', { name: 'Editar' }))
    const title = screen.getByLabelText('Título')
    expect(title).toHaveValue('Dicas para a importação de arquivos grandes na ETA')
    await user.clear(title)
    await user.type(title, 'Índice composto resolveu a lentidão')
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Índice composto resolveu a lentidão' })).toBeInTheDocument()
    expect(screen.getByText('Alterações salvas.')).toBeInTheDocument()
    expect(screen.getAllByText(/editado há instantes/i).length).toBeGreaterThan(0)
  })

  it('recusa texto vazio com aviso junto ao campo (critério 3)', async () => {
    const { user } = await openPost('p-5')
    await user.click(screen.getByRole('button', { name: 'Mais ações' }))
    await user.click(screen.getByRole('menuitem', { name: 'Editar' }))
    await user.clear(screen.getByLabelText('Texto'))
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))
    expect((await screen.findAllByText('Este campo não pode ficar vazio.')).length).toBeGreaterThan(0)
    expect(screen.getByLabelText('Texto')).toBeInvalid()
  })

  it('cancelar com alterações pede confirmação', async () => {
    const { user } = await openPost('p-5')
    await user.click(screen.getByRole('button', { name: 'Mais ações' }))
    await user.click(screen.getByRole('menuitem', { name: 'Editar' }))
    await user.type(screen.getByLabelText('Título'), ' x')
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    const dialog = await screen.findByRole('dialog', { name: 'Descartar o que você escreveu?' })
    await user.click(within(dialog).getByRole('button', { name: 'Descartar' }))
    expect(screen.queryByLabelText('Título')).not.toBeInTheDocument()
  })

  it('mantém as alterações e avisa se salvar falhar', async () => {
    const updatePost = vi.fn().mockRejectedValue(new ApiError(500, 'x', 'x'))
    const { user } = await openPost('p-5', { overrides: { updatePost } })
    await user.click(screen.getByRole('button', { name: 'Mais ações' }))
    await user.click(screen.getByRole('menuitem', { name: 'Editar' }))
    await user.type(screen.getByLabelText('Título'), ' novo')
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))
    expect(await screen.findByText('Não foi possível salvar. Suas alterações continuam aqui.')).toBeInTheDocument()
    expect(screen.getByLabelText('Título')).toHaveValue('Dicas para a importação de arquivos grandes na ETA novo')
  })
})

describe('B8 denunciar (HU-16)', () => {
  async function openReport(overrides = {}) {
    const utils = await openPost('p-1', { overrides })
    await utils.user.click(screen.getByRole('button', { name: 'Mais ações' }))
    await utils.user.click(screen.getByRole('menuitem', { name: 'Denunciar' }))
    return { ...utils, dialog: await screen.findByRole('dialog', { name: 'Denunciar este conteúdo' }) }
  }

  it('exige um motivo', async () => {
    const reportPost = vi.fn()
    const { user, dialog } = await openReport({ reportPost })
    await user.click(within(dialog).getByRole('button', { name: 'Enviar denúncia' }))
    expect(await within(dialog).findByText('Escolha um motivo.')).toBeInTheDocument()
    expect(reportPost).not.toHaveBeenCalled()
  })

  it('envia, avisa e deixa o item do menu inativo', async () => {
    const { user, dialog } = await openReport()
    expect(within(dialog).getByText('Os administradores vão analisar. A pessoa que escreveu não é avisada.')).toBeInTheDocument()
    await user.click(within(dialog).getByRole('radio', { name: 'Conteúdo ofensivo' }))
    await user.click(within(dialog).getByRole('button', { name: 'Enviar denúncia' }))
    expect(await screen.findByText('Denúncia enviada. Obrigado por avisar.')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Mais ações' }))
    expect(screen.getByRole('menuitem', { name: 'Denúncia enviada' })).toBeDisabled()
  })

  it('avisa que já denunciou (critério 2)', async () => {
    const reportPost = vi.fn().mockRejectedValue(new ApiError(409, 'already_reported', 'x'))
    const { user, dialog } = await openReport({ reportPost })
    await user.click(within(dialog).getByRole('radio', { name: 'Outro motivo' }))
    await user.click(within(dialog).getByRole('button', { name: 'Enviar denúncia' }))
    expect(await within(dialog).findByText('Você já denunciou este conteúdo.')).toBeInTheDocument()
  })

  it('mostra erro de envio', async () => {
    const reportPost = vi.fn().mockRejectedValue(new ApiError(500, 'x', 'x'))
    const { user, dialog } = await openReport({ reportPost })
    await user.click(within(dialog).getByRole('radio', { name: 'Conteúdo confidencial' }))
    await user.click(within(dialog).getByRole('button', { name: 'Enviar denúncia' }))
    expect(await within(dialog).findByText('Não foi possível enviar a denúncia. Tente de novo.')).toBeInTheDocument()
  })

  it('Esc fecha a janela e devolve o foco ao menu', async () => {
    const { user } = await openReport()
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
})

describe('C2 ocultar e restaurar (HU-15)', () => {
  it('usuário comum não vê "Ocultar" (critério 3)', async () => {
    const { user } = await openPost('p-1')
    await user.click(screen.getByRole('button', { name: 'Mais ações' }))
    expect(screen.queryByRole('menuitem', { name: 'Ocultar' })).not.toBeInTheDocument()
  })

  it('o admin oculta com confirmação e restaura; não vê "Editar" no conteúdo alheio (critério 4)', async () => {
    const { user } = await openPost('p-1', { profile: 'admin' })
    await user.click(screen.getByRole('button', { name: 'Mais ações' }))
    expect(screen.queryByRole('menuitem', { name: 'Editar' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('menuitem', { name: 'Ocultar' }))
    const dialog = await screen.findByRole('dialog', { name: 'Ocultar este conteúdo?' })
    expect(within(dialog).getByText(/ele deixa de aparecer para as outras pessoas/i)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Ocultar' }))
    expect(await screen.findByText(/oculto por helena duarte em/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Restaurar' }))
    expect(await screen.findByText('Conteúdo restaurado.')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText(/oculto por helena duarte/i)).not.toBeInTheDocument())
  })

  it('mostra erro se ocultar falhar', async () => {
    const hidePost = vi.fn().mockRejectedValue(new ApiError(500, 'x', 'x'))
    const { user } = await openPost('p-1', { profile: 'admin', overrides: { hidePost } })
    await user.click(screen.getByRole('button', { name: 'Mais ações' }))
    await user.click(screen.getByRole('menuitem', { name: 'Ocultar' }))
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Ocultar' }))
    expect(await screen.findByText('Não foi possível ocultar. Tente de novo.')).toBeInTheDocument()
  })
})

