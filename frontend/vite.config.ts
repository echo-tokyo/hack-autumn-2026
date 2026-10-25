import { fileURLToPath, URL } from 'node:url'

import babel from '@rolldown/plugin-babel'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type ProxyOptions } from 'vite'

const ENV_DIR = fileURLToPath(new URL('..', import.meta.url))
const PROXY_TIMEOUT = 60000

function createApiProxy(target: string): Record<string, ProxyOptions> {
  return {
    '/api': {
      target,
      changeOrigin: true,
      secure: false,
      timeout: PROXY_TIMEOUT,
      proxyTimeout: PROXY_TIMEOUT,
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ENV_DIR, '')
  const proxy = env.API_PROXY_TARGET
    ? createApiProxy(env.API_PROXY_TARGET)
    : undefined

  return {
    plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
    envDir: ENV_DIR,
    envPrefix: ['VITE_', 'TIMEZONE'],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: { proxy },
    preview: { proxy },
  }
})
