import { kv } from '@vercel/kv'

export function kvEnvIssue() {
  const url = String(process.env.KV_REST_API_URL ?? '').trim()
  const token = String(process.env.KV_REST_API_TOKEN ?? '').trim()

  if (!url) return 'KV_REST_API_URL_MISSING'
  if (!token) return 'KV_REST_API_TOKEN_MISSING'
  if (url.includes('`')) return 'KV_REST_API_URL_INVALID'
  if (!/^https?:\/\//.test(url)) return 'KV_REST_API_URL_INVALID'

  return null
}

export async function kvGet<T>(key: string) {
  return (await kv.get(key)) as T | null | undefined
}

export async function kvSet(key: string, value: unknown, opts?: { ex?: number }) {
  return kv.set(key, value, opts)
}

export async function kvDel(key: string) {
  return kv.del(key)
}
