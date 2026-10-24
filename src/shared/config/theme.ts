import {
  createTheme,
  type CSSVariablesResolver,
  type MantineColorsTuple,
} from '@mantine/core'

const orange: MantineColorsTuple = [
  '#fff3e6',
  '#ffe3c7',
  '#ffc48d',
  '#ffa250',
  '#ff8a22',
  '#ff7f0d',
  '#ff7a00',
  '#e36a00',
  '#ca5d00',
  '#ad4e00',
]

const dark: MantineColorsTuple = [
  '#ffffff',
  '#b3b3b3',
  '#666666',
  '#424242',
  '#2f2f2f',
  '#2b2b2b',
  '#252525',
  '#1f1f1f',
  '#131313',
  '#000000',
]

const OVERLAY_SHADOW = '0 8px 32px rgba(0, 0, 0, 0.6)'

export const theme = createTheme({
  colors: { orange, dark },
  primaryColor: 'orange',
  primaryShade: 6,
  autoContrast: true,
  respectReducedMotion: true,
  fontFamily: "'Onest Variable', sans-serif",
  headings: {
    fontFamily: "'Onest Variable', sans-serif",
    fontWeight: '700',
    sizes: {
      h1: { fontSize: '2rem', lineHeight: '1.2' },
      h2: { fontSize: '1.25rem', lineHeight: '1.3' },
    },
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.25rem',
    xl: '1.75rem',
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  radius: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
  },
  defaultRadius: 'md',
  shadows: {
    md: OVERLAY_SHADOW,
    lg: OVERLAY_SHADOW,
    xl: OVERLAY_SHADOW,
  },

  components: {
    Button: { defaultProps: { color: 'dark.0' } },
    Input: { defaultProps: { variant: 'filled' } },
    InputWrapper: {
      styles: {
        label: {
          fontSize: 'var(--mantine-font-size-sm)',
          fontWeight: 500,
          lineHeight: 1.3,
          marginBottom: 'calc(var(--mantine-spacing-xs) / 2)',
        },
        error: { fontSize: 'var(--mantine-font-size-xs)' },
      },
    },
    NavLink: {
      styles: {
        root: {
          borderRadius: 'var(--mantine-radius-md)',
          paddingBlock: 'var(--mantine-spacing-sm)',
        },
        label: { fontSize: 'var(--mantine-font-size-md)' },
      },
    },
  },
})

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {},
  dark: {
    '--mantine-color-body': '#000000',
    '--mantine-color-error': '#ff4d4d',
    '--color-surface-1': '#131313',
    '--color-surface-2': '#1f1f1f',
    '--color-surface-3': '#252525',
    '--color-border': '#2f2f2f',
    '--color-text-muted': '#666666',
    '--color-text-faint': '#424242',
    '--color-accent': '#ff7a00',
    '--color-success': '#2cc04d',
    '--color-danger': '#ff4d4d',
    '--color-button-disabled': '#a3a3a3',
  },
})
