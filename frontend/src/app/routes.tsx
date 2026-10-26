import type { RouteObject } from 'react-router-dom'
import { CadastroPage } from '../features/auth/CadastroPage'
import { ConfirmLinkPage } from '../features/auth/ConfirmLinkPage'
import { LoginPage } from '../features/auth/LoginPage'
import { VerifyEmailPage } from '../features/auth/VerifyEmailPage'
import { AccountPage } from '../features/account/AccountPage'
import { MyPostsPage } from '../features/account/MyPostsPage'
import { AdminPage } from '../features/admin/AdminPage'
import { PostDetailPage } from '../features/detail/PostDetailPage'
import { HomePage } from '../features/home/HomePage'
import { PublishPostPage } from '../features/publish/PublishPostPage'
import { PublishQuestionPage } from '../features/publish/PublishQuestionPage'
import { NotFoundPage } from '../features/states/NotFoundPage'
import { RequireAdmin, RequireSession } from './auth'
import { RootLayout } from './RootLayout'

/** Rotas do app. Telas sem sessão primeiro; depois as que exigem sessão (RNF-01). */
export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      { path: 'cadastro', element: <CadastroPage /> },
      { path: 'entrar', element: <LoginPage /> },
      { path: 'verifique-seu-email', element: <VerifyEmailPage /> },
      { path: 'confirmar', element: <ConfirmLinkPage /> },
      {
        element: <RequireSession />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'publicar/post', element: <PublishPostPage /> },
          { path: 'publicar/pergunta', element: <PublishQuestionPage /> },
          { path: 'posts/:id', element: <PostDetailPage /> },
          { path: 'minhas-publicacoes', element: <MyPostsPage /> },
          { path: 'conta', element: <AccountPage /> },
          { path: 'admin/:aba?', element: <RequireAdmin><AdminPage /></RequireAdmin> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
