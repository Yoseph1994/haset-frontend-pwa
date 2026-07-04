import { matchPath } from 'react-router'
import { useLocation } from 'react-router-dom'

/**
 * IonRouterOutlet clones <Route> children with its own page-stack bookkeeping match
 * (path === url, empty params), which shadows React Router's real `:param` match —
 * so `useParams()`/`props.match.params` come back empty inside Ionic pages. Matching
 * `useLocation()` against our own pattern sidesteps Ionic's outlet entirely.
 */
export function useRouteParams<T extends Record<string, string | undefined>>(pattern: string): T {
  const location = useLocation()
  const match = matchPath<T>(location.pathname, { path: pattern, exact: true })
  return (match?.params ?? {}) as T
}
