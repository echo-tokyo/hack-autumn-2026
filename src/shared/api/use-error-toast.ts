import { useEffect } from 'react'
import { toast } from 'sonner'

import { getErrorMessage } from './query-error'

export function useErrorToast(error: unknown) {
  useEffect(() => {
    if (error) {
      toast.error(getErrorMessage(error))
    }
  }, [error])
}
