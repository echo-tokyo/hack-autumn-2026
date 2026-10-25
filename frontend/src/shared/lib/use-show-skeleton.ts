import { useEffect, useState } from 'react'

const DEFAULT_DELAY = 200

export function useShowSkeleton(
  isLoading: boolean,
  delay = DEFAULT_DELAY,
): boolean {
  const [isDelayPassed, setIsDelayPassed] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      return
    }

    const timer = setTimeout(() => setIsDelayPassed(true), delay)

    return () => {
      clearTimeout(timer)
      setIsDelayPassed(false)
    }
  }, [isLoading, delay])

  return isLoading && isDelayPassed
}
