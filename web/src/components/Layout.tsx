import { Navigate, Link, Outlet, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../lib/useAuth'

export function Protected({ children }: { children: ReactNode }) {
  const { teacher, isLoading } = useAuth()
  if (isLoading) return <p className="p-8">Carregando…</p>
  return teacher ? <>{children}</> : <Navigate to="/login" replace />
}

export function Layout() {
  const { logout } = useAuth()
  const nav = useNavigate()
  return (
    <div>
      <nav className="flex items-center gap-4 border-b p-4">
        <Link to="/">Mês</Link>
        <Link to="/alunos">Alunos</Link>
        <Link to="/promocoes">Promoções</Link>
        <Link to="/perfil">Perfil</Link>
        <button className="ml-auto text-gray-600 underline" onClick={async () => { await logout(); nav('/login') }}>Sair</button>
      </nav>
      <Outlet />
    </div>
  )
}
