import { fileURLToPath, URL } from 'node:url'

import babel from '@rolldown/plugin-babel'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const PROXY_TIMEOUT = 60000

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
    envPrefix: ['VITE_', 'TIMEZONE'],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: env.API_PROXY_TARGET
        ? {
            '/api': {
              target: env.API_PROXY_TARGET,
              changeOrigin: true,
              secure: false,
              timeout: PROXY_TIMEOUT,
              proxyTimeout: PROXY_TIMEOUT,
            },
          }
        : undefined,
    },
  }
})
