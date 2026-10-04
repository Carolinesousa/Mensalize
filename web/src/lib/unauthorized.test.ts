import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import { apiFetch } from './api'
import { registerUnauthorizedHandler } from './unauthorized'

function makeRouter(pathname = '/') {
  return {
    navigate: vi.fn(),
    state: { location: { pathname } },
  }
}

describe('registerUnauthorizedHandler', () => {
  let cleanup: (() => void) | undefined

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    cleanup?.()
    cleanup = undefined
  })

  it('limpa o cache e navega para /login quando a sessão expira', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    client.setQueryData(['me'], { id: 1 })
    const router = makeRouter('/')
    cleanup = registerUnauthorizedHandler(router, client)
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 401 }))

    await expect(apiFetch('/me')).rejects.toThrowError(/401/)

    expect(client.getQueryCache().getAll()).toHaveLength(0)
    expect(router.navigate).toHaveBeenCalledWith('/login')
  })

  it('não redireciona quando já está em /login', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    client.setQueryData(['me'], { id: 1 })
    const router = makeRouter('/login')
    cleanup = registerUnauthorizedHandler(router, client)
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 401 }))

    await expect(apiFetch('/me')).rejects.toThrowError(/401/)

    expect(client.getQueryCache().getAll()).toHaveLength(0)
    expect(router.navigate).not.toHaveBeenCalled()
  })
})
