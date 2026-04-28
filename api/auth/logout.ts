import { kv } from '@vercel/kv'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { clearCookie, cookies, json, sessionCookieName } from '../_lib/auth'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return json(res, 405, { ok: false, error: 'METHOD_NOT_ALLOWED' })
  }

  const token = cookies(req)[sessionCookieName]
  if (token) await kv.del(`sess:${token}`)
  clearCookie(res, sessionCookieName)
  return json(res, 200, { ok: true })
}
