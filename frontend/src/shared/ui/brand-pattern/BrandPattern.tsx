import styles from './styles.module.css'

const LINES = [
  { path: 'M40 0 V240', color: 'white' },
  { path: 'M60 0 V240', color: 'white' },
  { path: 'M80 0 V240', color: 'white' },
  { path: 'M0 186 H400', color: 'accent' },
  { path: 'M0 204 H400', color: 'accent' },
  { path: 'M0 222 H400', color: 'accent' },
  { path: 'M120 0 V56 A32 32 0 0 0 152 88 H400', color: 'accent' },
  { path: 'M300 0 V124 A32 32 0 0 0 332 156 H400', color: 'white' },
] as const

interface IBrandPatternProps {
  className?: string
}

export function BrandPattern({ className }: IBrandPatternProps) {
  return (
    <svg
      className={[styles.pattern, className].filter(Boolean).join(' ')}
      viewBox='0 0 400 240'
      preserveAspectRatio='xMinYMax slice'
      aria-hidden
    >
      {LINES.map((line, index) => (
        <path
          key={line.path}
          className={styles.line}
          d={line.path}
          pathLength={1}
          data-color={line.color}
          style={{ animationDelay: `${index * 90}ms` }}
        />
      ))}
    </svg>
  )
}
