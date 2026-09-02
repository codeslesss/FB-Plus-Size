import { useEffect, useState } from 'react'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<UseApiState<T>>({ data: null, loading: true, error: null })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState((current) => ({ ...current, loading: true, error: null }))

    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({ data: null, loading: false, error: err instanceof Error ? err.message : 'Erro ao carregar dados' })
        }
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey])

  const reload = () => setReloadKey((key) => key + 1)

  return { ...state, reload }
}
