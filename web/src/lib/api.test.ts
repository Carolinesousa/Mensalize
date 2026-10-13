import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiFetch } from './api'

describe('apiFetch', () => {
  beforeEach(() => { vi.restoreAllMocks() })

  it('envia credenciais e parseia JSON', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 1 }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    )
    const data = await apiFetch<{ id: number }>('/me')
    expect(data.id).toBe(1)
    expect(spy).toHaveBeenCalledWith('/api/me', expect.objectContaining({ credentials: 'include' }))
  })

  it('lança erro em 401', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 401 }))
    await expect(apiFetch('/me')).rejects.toThrowError(/401/)
  })
})
