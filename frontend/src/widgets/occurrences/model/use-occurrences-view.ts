import { useSearchParams } from 'react-router'

export type TOccurrencesView = 'table' | 'calendar'

const VIEW_PARAM = 'view'

export function useOccurrencesView() {
  const [searchParams, setSearchParams] = useSearchParams()

  const view: TOccurrencesView =
    searchParams.get(VIEW_PARAM) === 'calendar' ? 'calendar' : 'table'

  function setView(nextView: TOccurrencesView) {
    setSearchParams(nextView === 'calendar' ? { [VIEW_PARAM]: nextView } : {}, {
      replace: true,
    })
  }

  return { view, setView }
}
