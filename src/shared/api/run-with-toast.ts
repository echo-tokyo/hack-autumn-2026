import { toast } from 'sonner'

import { getErrorMessage, type TStatusMessages } from './query-error'

interface IRunWithToastOptions {
  successMessage: string
  errorMessages?: TStatusMessages
}

export async function runWithToast(
  request: () => Promise<unknown>,
  { successMessage, errorMessages }: IRunWithToastOptions,
): Promise<boolean> {
  try {
    await request()
    toast.success(successMessage)
    return true
  } catch (error) {
    toast.error(getErrorMessage(error, errorMessages))
    return false
  }
}
