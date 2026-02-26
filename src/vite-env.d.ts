/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ANTHROPIC_API_KEY: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_STORAGE_MODE: 'local' | 'api';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
