/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_PLATFORM_NAME: string;
  readonly VITE_PLATAFORM_FAVICON: string;
  // outras variáveis de ambiente que você possa ter
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
