interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_MOCKS?: string
  readonly TIMEZONE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
