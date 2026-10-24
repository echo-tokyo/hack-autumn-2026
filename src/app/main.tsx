import '@/app/styles/index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router/dom'
import { Toaster } from 'sonner'

import { store } from './model/store'
import { router } from './routes/Router'

async function enableMocking() {
  if (import.meta.env.VITE_API_MOCKS !== 'true') {
    return
  }
  const { worker } = await import('./mocks/browser')
  await worker.start({ onUnhandledFrame: 'bypass' })
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element #root not found')
}

await enableMocking()

createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
      <Toaster position='bottom-center' />
    </Provider>
  </StrictMode>,
)
