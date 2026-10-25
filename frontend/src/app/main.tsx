import '@fontsource-variable/exo-2'
import '@fontsource-variable/inter/opsz.css'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import 'dayjs/locale/ru'
import '@/app/styles/index.css'

import { MantineProvider } from '@mantine/core'
import { DatesProvider } from '@mantine/dates'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router/dom'
import { Toaster } from 'sonner'

import { cssVariablesResolver, theme } from '@/shared/config'

import { store } from './model/store'
import { createAppRouter } from './routes/router'

async function enableMocking() {
  if (import.meta.env.VITE_API_MOCKS !== 'true') {
    return
  }
  const { worker } = await import('./mocks/browser')
  await worker.start({ onUnhandledFrame: 'bypass' })
}

const FONT_LOAD_TIMEOUT = 1500
const FONT_SAMPLE_TEXT = 'Aa Аа 0'
const APP_FONTS = ["400 1em 'Inter Variable'", "700 1em 'Exo 2 Variable'"]

async function loadFonts() {
  const fonts = APP_FONTS.map((font) =>
    document.fonts.load(font, FONT_SAMPLE_TEXT),
  )
  const timeout = new Promise((resolve) =>
    setTimeout(resolve, FONT_LOAD_TIMEOUT),
  )
  await Promise.race([Promise.allSettled(fonts), timeout])
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element #root not found')
}

await Promise.all([enableMocking(), loadFonts()])

const router = createAppRouter()

createRoot(rootElement).render(
  <StrictMode>
    <MantineProvider
      theme={theme}
      cssVariablesResolver={cssVariablesResolver}
      forceColorScheme='dark'
    >
      <DatesProvider settings={{ locale: 'ru', firstDayOfWeek: 1 }}>
        <Provider store={store}>
          <RouterProvider router={router} />
          <Toaster position='bottom-center' theme='dark' />
        </Provider>
      </DatesProvider>
    </MantineProvider>
  </StrictMode>,
)
