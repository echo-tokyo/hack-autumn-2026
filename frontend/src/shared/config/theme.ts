import {
  ActionIcon,
  Button,
  createTheme,
  type CSSVariablesResolver,
  type MantineColorsTuple,
  type MantineTransition,
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
  '#8a8a8a',
  '#424242',
  '#2f2f2f',
  '#2b2b2b',
  '#252525',
  '#1f1f1f',
  '#131313',
  '#000000',
]

const SUCCESS_COLOR = '#2cc04d'
const DANGER_COLOR = '#ff4d4d'

const OVERLAY_SHADOW = '0 8px 32px rgba(0, 0, 0, 0.6)'

const BUTTON_VARIANTS: Record<string, Record<string, string>> = {
  secondary: {
    '--button-bg': 'var(--mantine-color-dark-5)',
    '--button-hover': 'var(--mantine-color-dark-4)',
    '--button-color': 'var(--mantine-color-white)',
    '--button-bd': 'none',
  },
  'secondary-danger': {
    '--button-bg': 'var(--mantine-color-dark-5)',
    '--button-hover': 'var(--mantine-color-dark-4)',
    '--button-color': 'var(--color-danger)',
    '--button-bd': 'none',
  },
  danger: {
    '--button-bg': 'var(--color-danger)',
    '--button-hover': 'color-mix(in srgb, var(--color-danger) 85%, black)',
    '--button-color': 'var(--mantine-color-white)',
    '--button-bd': 'none',
  },
}

const MODAL_RISE: MantineTransition = {
  in: { opacity: 1, transform: 'translateY(0)' },
  out: { opacity: 0, transform: 'translateY(24px)' },
  transitionProperty: 'opacity, transform',
}

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
    ActionIcon: ActionIcon.extend({
      vars: (_theme, props) => ({
        root:
          props.variant === 'secondary'
            ? {
                '--ai-bg': 'var(--mantine-color-dark-5)',
                '--ai-hover': 'var(--mantine-color-dark-4)',
                '--ai-color': 'var(--mantine-color-white)',
                '--ai-bd': 'none',
              }
            : {},
      }),
    }),
    Button: Button.extend({
      defaultProps: { color: 'brand', size: 'md' },
      vars: (_theme, props) => ({
        root: BUTTON_VARIANTS[props.variant ?? ''] ?? {},
      }),
    }),
    Input: { defaultProps: { variant: 'filled' } },
    SegmentedControl: {
      defaultProps: { size: 'md' },
      styles: {
        root: {
          height: 'calc(2.625rem * var(--mantine-scale))',
          boxSizing: 'border-box',
          backgroundColor: 'var(--mantine-color-dark-5)',
        },
        indicator: { backgroundColor: 'var(--mantine-color-dark-3)' },
        control: { display: 'flex' },
        label: { display: 'flex', alignItems: 'center' },
      },
    },
    TextInput: { defaultProps: { size: 'md' } },
    PasswordInput: { defaultProps: { size: 'md' } },
    Select: { defaultProps: { size: 'md' } },
    NumberInput: { defaultProps: { size: 'md' } },
    DatePickerInput: {
      defaultProps: {
        size: 'md',
        popoverProps: {
          preventPositionChangeWhenVisible: false,
          middlewares: { flip: true, shift: true, size: true },
          styles: { dropdown: { overflowY: 'auto' } },
        },
      },
    },
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
    Table: {
      styles: {
        th: {
          backgroundColor: 'var(--color-surface-2)',
          fontWeight: 400,
          color: 'var(--mantine-color-dimmed)',
        },
      },
    },
    Modal: {
      defaultProps: {
        radius: 'xl',
        padding: 'lg',
        centered: true,
        overlayProps: { backgroundOpacity: 0.75 },
        transitionProps: { transition: MODAL_RISE, duration: 200 },
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
    '--mantine-color-body': 'var(--mantine-color-dark-9)',
    '--mantine-color-error': DANGER_COLOR,
    '--color-surface-1': 'var(--mantine-color-dark-8)',
    '--color-surface-2': 'var(--mantine-color-dark-7)',
    '--color-surface-3': 'var(--mantine-color-dark-6)',
    '--color-border': 'var(--mantine-color-dark-4)',
    '--color-text-muted': 'var(--mantine-color-dark-2)',
    '--color-text-faint': 'var(--mantine-color-dark-3)',
    '--color-accent': 'var(--mantine-color-brand-6)',
    '--color-success': SUCCESS_COLOR,
    '--color-danger': DANGER_COLOR,
  },
})
