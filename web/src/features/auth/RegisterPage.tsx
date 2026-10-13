import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../lib/useAuth'

export function RegisterPage() {
  const { register } = useAuth()
  const nav = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', hourly_rate: '' })
  const [error, setError] = useState('')
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value })
  return (
    <form className="mx-auto mt-24 max-w-sm space-y-4" onSubmit={async (e) => {
      e.preventDefault()
      try { await register(form); nav('/') } catch { setError('Não foi possível cadastrar. Verifique os dados.') }
    }}>
      <h1 className="text-2xl font-bold">Criar conta</h1>
      <input aria-label="Nome" className="w-full rounded border p-2" placeholder="Nome" value={form.name} onChange={set('name')} />
      <input aria-label="E-mail" className="w-full rounded border p-2" placeholder="E-mail" value={form.email} onChange={set('email')} />
      <input aria-label="Senha" className="w-full rounded border p-2" type="password" placeholder="Senha" value={form.password} onChange={set('password')} />
      <input aria-label="Confirmar senha" className="w-full rounded border p-2" type="password" placeholder="Confirmar senha" value={form.password_confirmation} onChange={set('password_confirmation')} />
      <input aria-label="Hora-aula" className="w-full rounded border p-2" placeholder="Valor da hora-aula (ex.: 20.00)" value={form.hourly_rate} onChange={set('hourly_rate')} />
      {error && <p className="text-red-600">{error}</p>}
      <button className="w-full rounded bg-indigo-600 p-2 text-white" type="submit">Cadastrar</button>
      <p>Já tem conta? <Link className="text-indigo-600" to="/login">Entrar</Link></p>
    </form>
  )
}
