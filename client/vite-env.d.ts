/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly SQUELIFY_VERSION: string
}

export interface ImportMeta {
  readonly env: ImportMetaEnv
}
