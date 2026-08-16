// Next.js only inlines NEXT_PUBLIC_* vars when referenced statically as
// `process.env.NEXT_PUBLIC_FOO` — a dynamic `process.env[someVar]` lookup
// is never replaced and resolves to undefined in the client bundle. These
// maps give components a safe way to look up a per-program env var by key.

export const GOOGLE_FORM_IDS: Record<string, string | undefined> = {
  NEXT_PUBLIC_GOOGLE_FORM_ID_ASISTENCIA_QUIRURGICA:
    process.env.NEXT_PUBLIC_GOOGLE_FORM_ID_ASISTENCIA_QUIRURGICA,
  NEXT_PUBLIC_GOOGLE_FORM_ID_SUTURA:
    process.env.NEXT_PUBLIC_GOOGLE_FORM_ID_SUTURA,
  NEXT_PUBLIC_GOOGLE_FORM_ID_NEUROIMAGENES:
    process.env.NEXT_PUBLIC_GOOGLE_FORM_ID_NEUROIMAGENES,
  NEXT_PUBLIC_GOOGLE_FORM_ID_LAPAROSCOPICA:
    process.env.NEXT_PUBLIC_GOOGLE_FORM_ID_LAPAROSCOPICA,
};

export const PAGADITO_URLS: Record<string, string | undefined> = {
  NEXT_PUBLIC_PAGADITO_URL_ASISTENCIA_QUIRURGICA:
    process.env.NEXT_PUBLIC_PAGADITO_URL_ASISTENCIA_QUIRURGICA,
  NEXT_PUBLIC_PAGADITO_URL_SUTURA:
    process.env.NEXT_PUBLIC_PAGADITO_URL_SUTURA,
  NEXT_PUBLIC_PAGADITO_URL_NEUROIMAGENES:
    process.env.NEXT_PUBLIC_PAGADITO_URL_NEUROIMAGENES,
  NEXT_PUBLIC_PAGADITO_URL_LAPAROSCOPICA:
    process.env.NEXT_PUBLIC_PAGADITO_URL_LAPAROSCOPICA,
};

export function isPlaceholderEnv(value: string | undefined): boolean {
  return !value || value.startsWith("REEMPLAZA");
}
