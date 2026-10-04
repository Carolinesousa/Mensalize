import { createBrowserRouter, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { LoginPage } from './features/auth/LoginPage'
import { RegisterPage } from './features/auth/RegisterPage'
import { useAuth } from './lib/useAuth'

// Placeholder: substituído pela MonthView na Task 10.
function Home() { return <p className="p-8">Bem-vinda ao Mensalize.</p> }

function Protected({ children }: { children: ReactNode }) {
  const { teacher, isLoading } = useAuth()
  if (isLoading) return <p className="p-8">Carregando…</p>
  return teacher ? <>{children}</> : <Navigate to="/login" replace />
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/registrar', element: <RegisterPage /> },
  { path: '/', element: <Protected><Home /></Protected> },
])
