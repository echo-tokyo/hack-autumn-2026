import {
  createTheme,
  type CSSVariablesResolver,
  type MantineColorsTuple,
} from '@mantine/core'

const brand: MantineColorsTuple = [
  '#e6f8fe',
  '#cdeffc',
  '#9fe0f9',
  '#6fd1f5',
  '#5ccbf3',
  '#53c8f2',
  '#4cc6f1',
  '#2fb3e2',
  '#1b9fcd',
  '#0789b4',
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
  colors: { brand, dark },
  primaryColor: 'brand',
  primaryShade: 6,
  autoContrast: true,
  respectReducedMotion: true,
  fontFamily: "'Inter Variable', sans-serif",
  headings: {
    fontFamily: "'Exo 2 Variable', sans-serif",
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
    Button: { defaultProps: { color: 'brand', size: 'md' } },
    Input: { defaultProps: { variant: 'filled' } },
    TextInput: { defaultProps: { size: 'md' } },
    PasswordInput: { defaultProps: { size: 'md' } },
    Select: { defaultProps: { size: 'md' } },
    NumberInput: { defaultProps: { size: 'md' } },
    DatePickerInput: { defaultProps: { size: 'md' } },
    InputWrapper: {
      styles: {
        label: {
          fontSize: 'var(--mantine-font-size-sm)',
          fontWeight: 400,
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
    Modal: {
      defaultProps: {
        radius: 'xl',
        padding: 'lg',
        centered: true,
        overlayProps: { backgroundOpacity: 0.75 },
        transitionProps: { transition: 'slide-up', duration: 250 },
      },
      styles: {
        content: { backgroundColor: 'var(--color-surface-2)' },
        header: {
          backgroundColor: 'var(--color-surface-2)',
          paddingBottom: 'var(--mantine-spacing-xs)',
        },
        title: {
          fontFamily: 'var(--mantine-font-family-headings)',
          fontSize: 'var(--mantine-font-size-lg)',
          fontWeight: 700,
        },
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
    '--color-accent': '#4cc6f1',
    '--color-success': '#2cc04d',
    '--color-danger': '#ff4d4d',
    '--color-button-disabled': '#a3a3a3',
  },
})
