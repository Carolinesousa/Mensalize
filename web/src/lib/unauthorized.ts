import type { QueryClient } from '@tanstack/react-query'

type NavigableRouter = {
  navigate: (to: string) => unknown
  state: { location: { pathname: string } }
}

/** Rotas públicas: um 401 aqui é esperado (ex.: sonda de sessão) e não deve redirecionar. */
const PUBLIC_ROUTES = ['/login', '/registrar']

/**
 * Limpa o cache e redireciona para o login quando a API responde 401
 * (sessão expirada). Não redireciona em rotas públicas.
 */
export function registerUnauthorizedHandler(
  router: NavigableRouter,
  queryClient: QueryClient,
): () => void {
  const handler = () => {
    queryClient.clear()
    if (!PUBLIC_ROUTES.includes(router.state.location.pathname)) {
      router.navigate('/login')
    }
  }
  window.addEventListener('unauthorized', handler)
  return () => window.removeEventListener('unauthorized', handler)
}
