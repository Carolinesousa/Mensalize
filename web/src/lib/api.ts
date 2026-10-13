export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(`${status} ${message}`)
    this.status = status
  }
}

function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp('(^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[2]) : ''
}

let csrfReady = false
export async function ensureCsrf(): Promise<void> {
  if (csrfReady) return
  await fetch('/sanctum/csrf-cookie', { credentials: 'include' })
  csrfReady = true
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase()
  if (method !== 'GET') await ensureCsrf()

  const headers = new Headers({
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  })
  if (method !== 'GET') headers.set('X-XSRF-TOKEN', getCookie('XSRF-TOKEN'))

  const res = await fetch(`/api${path}`, { credentials: 'include', ...options, headers })
  if (res.status === 401) {
    window.dispatchEvent(new Event('unauthorized'))
    throw new ApiError(401, 'unauthenticated')
  }
  if (!res.ok) throw new ApiError(res.status, await res.text())
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}
