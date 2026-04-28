import type { IncomingMessage, ServerResponse } from 'node:http'
import {
  json,
  newSessionToken,
  readJson,
  sessionCookieName,
  setCookie,
  verifyPassword,
} from '../_lib/auth.js'
import { kvEnvIssue, kvGet, kvSet } from '../_lib/store.js'

type LoginBody = { username?: unknown; password?: unknown }

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Cache-Control', 'no-store')

  const issue = kvEnvIssue()
  if (issue) return json(res, 500, { ok: false, error: issue })

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return json(res, 405, { ok: false, error: 'METHOD_NOT_ALLOWED' })
  }

  let body: LoginBody | null = null
  try {
    body = (await readJson(req)) as LoginBody
  } catch {
    return json(res, 400, { ok: false, error: 'BAD_JSON' })
  }

  const username = String(body?.username ?? '').trim()
  const password = String(body?.password ?? '')
  if (!username || !password) return json(res, 400, { ok: false, error: 'MISSING' })

  const user = (await kvGet(`user:${username}`)) as
    | { username: string; pass: { salt: string; hash: string } }
    | null
    | undefined

  if (!user) return json(res, 401, { ok: false, error: 'INVALID_CREDENTIALS' })

  const ok = verifyPassword(password, user.pass)
  if (!ok) return json(res, 401, { ok: false, error: 'INVALID_CREDENTIALS' })

  const token = newSessionToken()
  const sessionKey = `sess:${token}`
  const ttlSeconds = 60 * 60 * 24 * 14
  await kvSet(sessionKey, { username, createdAt: Date.now() }, { ex: ttlSeconds })

  const proto = req.headers['x-forwarded-proto']
  const secure = (Array.isArray(proto) ? proto[0] : proto) === 'https'
  setCookie(res, sessionCookieName, token, {
    httpOnly: true,
    secure,
    sameSite: 'Lax',
    path: '/',
    maxAge: ttlSeconds,
  })

  return json(res, 200, { ok: true, user: { username } })
}
