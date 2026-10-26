import { useQueryClient } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import type { Me } from '../api'
import { useApi } from '../app/ApiContext'
import { ME_KEY } from '../app/queryClient'
import { Avatar } from '../components/ui/Avatar'
import { buttonClass } from '../components/ui/Button'
import { Dialog } from '../components/ui/Dialog'
import { Icon } from '../components/ui/Icon'
import { Menu } from '../components/ui/Menu'
import { useIsMobile, useOnline } from '../lib/hooks'
import { Brand } from './Brand'
import styles from './AppLayout.module.css'

export function OfflineBanner() {
  const online = useOnline()
  if (online) return null
  return (
    <div className={styles.offline} role="status">
      <Icon name="wifiOff" size={18} /> Você está sem conexão. Vamos tentar de novo quando ela voltar.
    </div>
  )
}

function useLogout() {
  const api = useApi()
  const client = useQueryClient()
  const navigate = useNavigate()
  return async () => {
    await api.logout().catch(() => undefined)
    client.clear()
    client.setQueryData(ME_KEY, null)
    navigate('/entrar', { replace: true })
  }
}

function DesktopHeader({ me }: { me: Me }) {
  const navigate = useNavigate()
  const logout = useLogout()
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Brand />
        <nav aria-label="Principal" className={styles.nav}>
          <NavLink to="/" end className={({ isActive }) => [styles.navLink, isActive ? styles.navActive : ''].join(' ')}>
            Início
          </NavLink>
          {me.role === 'admin' ? (
            <NavLink to="/admin" className={({ isActive }) => [styles.navLink, isActive ? styles.navActive : ''].join(' ')}>
              Administração
            </NavLink>
          ) : null}
        </nav>
        <div className={styles.actions}>
          <Link to="/publicar/pergunta" className={buttonClass('primary')}>Fazer uma pergunta</Link>
          <Link to="/publicar/post" className={buttonClass('outline')}>Criar um post</Link>
          <Menu
            label={`Conta de ${me.name}`}
            align="end"
            className={styles.account}
            trigger={<><Avatar name={me.name} /> <span className={styles.accountName}>{me.name}</span></>}
            items={[
              { label: 'Minha conta', icon: 'user', onSelect: () => navigate('/conta') },
              { label: 'Minhas publicações', icon: 'message', onSelect: () => navigate('/minhas-publicacoes') },
              { label: 'Sair', icon: 'close', onSelect: () => void logout() },
            ]}
          />
        </div>
      </div>
    </header>
  )
}

function MobileHeader({ me }: { me: Me }) {
  const navigate = useNavigate()
  const logout = useLogout()
  const [menuOpen, setMenuOpen] = useState(false)
  const links: { to: string; label: string }[] = [
    { to: '/', label: 'Início' },
    ...(me.role === 'admin' ? [{ to: '/admin', label: 'Administração' }] : []),
    { to: '/conta', label: 'Minha conta' },
    { to: '/minhas-publicacoes', label: 'Minhas publicações' },
  ]
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Brand />
        <div className={styles.mobileActions}>
          <button type="button" className={styles.iconButton} aria-label="Ir para a busca" onClick={() => navigate('/', { state: { focusSearch: Date.now() } })}>
            <Icon name="search" size={22} />
          </button>
          <button type="button" className={styles.iconButton} aria-label="Menu" aria-haspopup="dialog" onClick={() => setMenuOpen(true)}>
            <Icon name="menu" size={22} />
          </button>
        </div>
      </div>
      {menuOpen ? (
        <Dialog title="Menu" sheet onClose={() => setMenuOpen(false)}>
          <nav aria-label="Menu" className={styles.sheetNav}>
            {links.map((link) => (
              <Link key={link.to} to={link.to} className={styles.sheetLink} onClick={() => setMenuOpen(false)}>{link.label}</Link>
            ))}
            <button type="button" className={styles.sheetLink} onClick={() => { setMenuOpen(false); void logout() }}>Sair</button>
          </nav>
        </Dialog>
      ) : null}
    </header>
  )
}

function PublishFab() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" className={styles.fab} aria-haspopup="dialog" onClick={() => setOpen(true)}>
        <Icon name="plus" size={20} /> Publicar
      </button>
      {open ? (
        <Dialog title="Publicar" sheet onClose={() => setOpen(false)}>
          <nav aria-label="Publicar" className={styles.sheetNav}>
            <Link to="/publicar/pergunta" className={styles.sheetLink} onClick={() => setOpen(false)}>Fazer uma pergunta</Link>
            <Link to="/publicar/post" className={styles.sheetLink} onClick={() => setOpen(false)}>Criar um post</Link>
          </nav>
        </Dialog>
      ) : null}
    </>
  )
}

/** Casca das telas com sessão: link de pular, cabeçalho (desktop ou celular), conteúdo e botão "Publicar" no celular. */
export function AppLayout({ me, children }: { me: Me; children: ReactNode }) {
  const mobile = useIsMobile()
  const { pathname } = useLocation()
  // Nas telas de publicar, a barra de ações fixa ocupa o lugar do botão flutuante.
  const showFab = mobile && !pathname.startsWith('/publicar')
  return (
    <div className={styles.page}>
      <a href="#conteudo" className={styles.skip}>Pular para o conteúdo</a>
      <OfflineBanner />
      {mobile ? <MobileHeader me={me} /> : <DesktopHeader me={me} />}
      <main id="conteudo" tabIndex={-1} className={styles.main}>
        {children}
      </main>
      {showFab ? <PublishFab /> : null}
    </div>
  )
}
