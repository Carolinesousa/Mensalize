import { createBrowserRouter, Navigate, Link, Outlet, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { LoginPage } from './features/auth/LoginPage'
import { RegisterPage } from './features/auth/RegisterPage'
import { StudentsPage } from './features/students/StudentsPage'
import { PromotionsPage } from './features/promotions/PromotionsPage'
import { useAuth } from './lib/useAuth'

// Placeholder: substituído pela MonthView na Task 10.
function Home() { return <p className="p-8">Bem-vinda ao Mensalize.</p> }

function Protected({ children }: { children: ReactNode }) {
  const { teacher, isLoading } = useAuth()
  if (isLoading) return <p className="p-8">Carregando…</p>
  return teacher ? <>{children}</> : <Navigate to="/login" replace />
}

function Layout() {
  const { logout } = useAuth()
  const nav = useNavigate()
  return (
    <div>
      <nav className="flex items-center gap-4 border-b p-4">
        <Link to="/">Mês</Link>
        <Link to="/alunos">Alunos</Link>
        <Link to="/promocoes">Promoções</Link>
        <button className="ml-auto text-gray-600 underline" onClick={async () => { await logout(); nav('/login') }}>Sair</button>
      </nav>
      <Outlet />
    </div>
  )
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/registrar', element: <RegisterPage /> },
  {
    path: '/',
    element: <Protected><Layout /></Protected>,
    children: [
      { index: true, element: <Home /> },
      { path: 'alunos', element: <StudentsPage /> },
      { path: 'promocoes', element: <PromotionsPage /> },
    ],
  },
])
