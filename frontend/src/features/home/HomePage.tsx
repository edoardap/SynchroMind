import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { useApi } from '../../app/ApiContext'
import { Button, ButtonLink } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog'
import { ErrorState, SkeletonList, StateBlock } from '../../components/ui/Feedback'
import { Icon } from '../../components/ui/Icon'
import { useDocumentTitle, useIsMobile } from '../../lib/hooks'
import { pluralize } from '../../lib/text'
import { PostListItem } from '../posts/PostListItem'
import { usePostList } from '../posts/queries'
import postStyles from '../posts/posts.module.css'
import { FilterPanel } from './FilterPanel'
import { useHomeParams } from './useHomeParams'
import styles from './home.module.css'

/** "Ainda buscando..." depois de 2 s (meta do RNF-02). */
function useSlow(active: boolean, ms: number): boolean {
  const [slow, setSlow] = useState(false)
  useEffect(() => {
    if (!active) return
    const timer = setTimeout(() => setSlow(true), ms)
    return () => {
      clearTimeout(timer)
      setSlow(false)
    }
  }, [active, ms])
  return slow
}

function ResolvedCard() {
  return (
    <section className={`${styles.dark} sobre-escuro`} aria-labelledby="tem-algo">
      <p className="rotulo">Crie um post</p>
      <h2 id="tem-algo">Tem algo para contar?</h2>
      <p>Publique um post sobre qualquer assunto da empresa: uma solução, um aviso ou uma novidade do seu time.</p>
      <ButtonLink to="/publicar/post">Criar um post</ButtonLink>
    </section>
  )
}

function SearchBar({ initial, onSearch, focusSignal }: { initial: string; onSearch: (q: string) => void; focusSignal?: number }) {
  const [draft, setDraft] = useState(initial)
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (focusSignal) input.current?.focus()
  }, [focusSignal])
  function submit(event: FormEvent) {
    event.preventDefault()
    onSearch(draft.trim())
  }
  return (
    <form role="search" className={styles.search} onSubmit={submit}>
      <div className={styles.searchField}>
        <label htmlFor="busca" className="somente-leitor">Buscar publicações</label>
        <input
          id="busca"
          ref={input}
          type="search"
          className={styles.searchInput}
          placeholder="Ex.: erro ao subir o container"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
      </div>
      <Button type="submit" variant="dark" size="lg">Buscar</Button>
    </form>
  )
}

/** B1: início, com busca, lista, filtro por tipo e tag (HU-06 crit. 3, HU-10, HU-12). */
export function HomePage() {
  useDocumentTitle('Início')
  const location = useLocation()
  const isMobile = useIsMobile()
  const { filters, update, clear, activeCount } = useHomeParams()
  const [sheetOpen, setSheetOpen] = useState(false)
  const searching = filters.q.length > 0
  const query = usePostList({ q: filters.q || undefined, kind: filters.kind, tag: filters.tag, sort: searching ? undefined : filters.sort })
  const slow = useSlow(query.isFetching, 2000)

  const items = query.data?.pages.flatMap((page) => page.items) ?? []
  // Nome da tag com a caixa original ("SynchroTDF"), achado nas tags mais usadas ou nos itens da lista.
  const api = useApi()
  const knownTags = useQuery({ queryKey: ['tags', ''], queryFn: () => api.suggestTags(''), staleTime: 30_000 })
  const tagLabel =
    items.flatMap((p) => p.tags).find((t) => t.slug === filters.tag)?.name ??
    knownTags.data?.find((t) => t.slug === filters.tag)?.name ??
    filters.tag
  const terms = filters.q.split(/\s+/).filter(Boolean)
  const stale = query.isPlaceholderData
  const hasFilters = searching || !!filters.kind || !!filters.tag
  const countLabel = searching
    ? `${items.length}${query.hasNextPage ? '+' : ''} ${items.length === 1 && !query.hasNextPage ? 'resultado' : 'resultados'} para '${filters.q}'`
    : `${items.length}${query.hasNextPage ? '+' : ''} ${pluralize(items.length, 'publicação', 'publicações').replace(/^\d+ /, '')}`

  function renderList() {
    const rows = (slice: typeof items) => (
      <ul className={postStyles.list} aria-label="Publicações">
        {slice.map((post) => <PostListItem key={post.id} post={post} terms={terms} />)}
      </ul>
    )
    if (isMobile && items.length > 3) {
      return (
        <>
          {rows(items.slice(0, 3))}
          <div className={styles.inline}><ResolvedCard /></div>
          {rows(items.slice(3))}
        </>
      )
    }
    return rows(items)
  }

  function renderBody() {
    if (query.isPending) return <SkeletonList rows={5} />
    if (query.isError) {
      return (
        <ErrorState
          message="Não foi possível carregar as publicações."
          onRetry={() => void query.refetch()}
          retrying={query.isRefetching}
        />
      )
    }
    if (items.length === 0) {
      if (searching) {
        return (
          <StateBlock
            icon="search"
            title={`Nenhum resultado para '${filters.q}'.`}
            actions={
              <>
                <ButtonLink to={`/publicar/pergunta?titulo=${encodeURIComponent(filters.q)}`}>Fazer uma pergunta com este termo</ButtonLink>
                <Button variant="outline" onClick={() => update({ q: undefined })}>Limpar busca</Button>
              </>
            }
          >
            <p>Confira a escrita ou use palavras mais gerais.</p>
          </StateBlock>
        )
      }
      if (filters.tag) {
        return (
          <StateBlock icon="search" title={`Nenhuma publicação com a tag #${tagLabel}.`} actions={<Button onClick={clear}>Ver todas as publicações</Button>} />
        )
      }
      if (hasFilters) {
        return (
          <StateBlock icon="search" title="Nenhuma publicação com esses filtros." actions={<Button onClick={clear}>Ver todas as publicações</Button>} />
        )
      }
      return (
        <StateBlock
          icon="message"
          title="Ainda não há publicações"
          actions={
            <>
              <ButtonLink to="/publicar/post">Criar um post</ButtonLink>
              <ButtonLink to="/publicar/pergunta" variant="outline">Fazer uma pergunta</ButtonLink>
            </>
          }
        >
          <p>Seja a primeira pessoa a publicar um post ou a fazer uma pergunta.</p>
        </StateBlock>
      )
    }
    return (
      <>
        <div className={stale ? styles.stale : undefined}>{renderList()}</div>
        {query.hasNextPage ? (
          <div className={styles.footerMore}>
            <Button variant="outline" onClick={() => void query.fetchNextPage()} loading={query.isFetchingNextPage} loadingText="Carregando...">
              Carregar mais
            </Button>
          </div>
        ) : null}
      </>
    )
  }

  const showBar = !query.isPending && !query.isError && items.length > 0

  return (
    <div>
      <div className={styles.hero}>
        <h1>O que você precisa resolver?</h1>
        <p className={styles.lead}>Busque no que a empresa já resolveu. Se não achar, pergunte.</p>
      </div>
      <SearchBar key={filters.q} initial={filters.q} onSearch={(q) => update({ q: q || undefined })} focusSignal={(location.state as { focusSearch?: number } | null)?.focusSearch} />

      <div className={styles.layout}>
        <section aria-label="Resultados">
          <p className="somente-leitor" role="status" aria-live="polite">
            {query.isFetching && !query.isFetchingNextPage ? (slow ? 'Ainda buscando...' : 'Buscando...') : ''}
          </p>
          {isMobile ? (
            <Button variant="outline" icon="filter" className={styles.filterButton} onClick={() => setSheetOpen(true)} aria-haspopup="dialog">
              {activeCount > 0 ? `Filtrar (${activeCount})` : 'Filtrar'}
            </Button>
          ) : null}
          {filters.kind || filters.tag ? (
            <ul className={styles.chips} aria-label="Filtros aplicados">
              {filters.tag ? (
                <li>
                  <button type="button" className={styles.chip} aria-label={`Remover filtro #${tagLabel}`} onClick={() => update({ tag: undefined })}>
                    #{tagLabel} <Icon name="close" size={14} />
                  </button>
                </li>
              ) : null}
              {filters.kind ? (
                <li>
                  <button type="button" className={styles.chip} aria-label={`Remover filtro ${kindName(filters.kind)}`} onClick={() => update({ tipo: undefined })}>
                    {kindName(filters.kind)} <Icon name="close" size={14} />
                  </button>
                </li>
              ) : null}
            </ul>
          ) : null}
          {showBar ? (
            <div className={styles.bar}>
              <p className={styles.count}>{countLabel}</p>
              {!searching ? (
                <label className={styles.sort}>
                  Ordenar por
                  <select value={filters.sort} onChange={(e) => update({ ordem: e.target.value === 'votes' ? 'votes' : undefined })}>
                    <option value="recent">Recentes</option>
                    <option value="votes">Mais votados</option>
                  </select>
                </label>
              ) : null}
            </div>
          ) : null}
          {renderBody()}
        </section>

        {!isMobile ? (
          <aside className={styles.sidebar} aria-label="Filtros e atalhos">
            <section className={styles.filterCard} aria-labelledby="filtros">
              <h2 id="filtros" style={{ fontSize: 20 }}>Filtros</h2>
              <FilterPanel kind={filters.kind} tag={filters.tag} onKind={(tipo) => update({ tipo })} onTag={(tag) => update({ tag })} />
            </section>
            <ResolvedCard />
          </aside>
        ) : null}
      </div>

      {sheetOpen ? (
        <Dialog
          title="Filtros"
          sheet
          onClose={() => setSheetOpen(false)}
          actions={
            <>
              <Button variant="outline" onClick={() => { clear(); setSheetOpen(false) }}>Limpar</Button>
              <Button onClick={() => setSheetOpen(false)}>
                Ver {items.length}{query.hasNextPage ? '+' : ''} {items.length === 1 && !query.hasNextPage ? 'resultado' : 'resultados'}
              </Button>
            </>
          }
        >
          <FilterPanel kind={filters.kind} tag={filters.tag} onKind={(tipo) => update({ tipo })} onTag={(tag) => update({ tag })} />
        </Dialog>
      ) : null}
    </div>
  )
}

function kindName(kind: string): string {
  return kind === 'question' ? 'Perguntas' : 'Posts'
}
