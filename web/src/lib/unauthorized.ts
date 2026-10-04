import type { QueryClient } from '@tanstack/react-query'

type NavigableRouter = {
  navigate: (to: string) => unknown
  state: { location: { pathname: string } }
}

/**
 * Limpa o cache e redireciona para o login quando a API responde 401
 * (sessão expirada). Não redireciona se já estiver em /login.
 */
export function registerUnauthorizedHandler(
  router: NavigableRouter,
  queryClient: QueryClient,
): () => void {
  const handler = () => {
    queryClient.clear()
    if (router.state.location.pathname !== '/login') {
      router.navigate('/login')
    }
  }
  window.addEventListener('unauthorized', handler)
  return () => window.removeEventListener('unauthorized', handler)
}
