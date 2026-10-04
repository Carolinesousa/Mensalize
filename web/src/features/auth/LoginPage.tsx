import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../lib/useAuth'

export function LoginPage() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  return (
    <form className="mx-auto mt-24 max-w-sm space-y-4" onSubmit={async (e) => {
      e.preventDefault()
      try { await login(email, password); nav('/') } catch { setError('Credenciais inválidas.') }
    }}>
      <h1 className="text-2xl font-bold">Entrar no Mensalize</h1>
      <input className="w-full rounded border p-2" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="w-full rounded border p-2" type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p className="text-red-600">{error}</p>}
      <button className="w-full rounded bg-indigo-600 p-2 text-white" type="submit">Entrar</button>
      <p>Não tem conta? <Link className="text-indigo-600" to="/registrar">Cadastre-se</Link></p>
    </form>
  )
}
