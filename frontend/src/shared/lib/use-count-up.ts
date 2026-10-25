import { useEffect, useRef, useState } from 'react'

const DEFAULT_DURATION = 800

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function easeOutCubic(progress: number): number {
  return 1 - (1 - progress) ** 3
}

function roundLike(value: number, target: number): number {
  return Number.isInteger(target)
    ? Math.round(value)
    : Math.round(value * 100) / 100
}

export function useCountUp(
  target: number,
  animateFromZero = true,
  duration = DEFAULT_DURATION,
) {
  const initialValue = animateFromZero ? 0 : target
  const [value, setValue] = useState(initialValue)
  const currentRef = useRef(initialValue)

  useEffect(() => {
    const from = currentRef.current
    const total = prefersReducedMotion() ? 0 : duration
    const start = performance.now()
    let frame = 0

    function tick(now: number) {
      const elapsed = Math.max(now - start, 0)
      const progress = total === 0 ? 1 : Math.min(elapsed / total, 1)
      currentRef.current = from + (target - from) * easeOutCubic(progress)
      setValue(currentRef.current)

      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      }
    }

    frame = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return roundLike(value, target)
}
