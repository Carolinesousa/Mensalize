import { createBrowserRouter } from 'react-router-dom'
import { LoginPage } from './features/auth/LoginPage'
import { RegisterPage } from './features/auth/RegisterPage'
import { StudentsPage } from './features/students/StudentsPage'
import { PromotionsPage } from './features/promotions/PromotionsPage'
import { ProfilePage } from './features/profile/ProfilePage'
import { MonthView } from './features/invoices/MonthView'
import { InvoiceDetail } from './features/invoices/InvoiceDetail'
import { Layout, Protected } from './components/Layout'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/registrar', element: <RegisterPage /> },
  {
    path: '/',
    element: <Protected><Layout /></Protected>,
    children: [
      { index: true, element: <MonthView /> },
      { path: 'invoices/:id', element: <InvoiceDetail /> },
      { path: 'alunos', element: <StudentsPage /> },
      { path: 'promocoes', element: <PromotionsPage /> },
      { path: 'perfil', element: <ProfilePage /> },
    ],
  },
])
