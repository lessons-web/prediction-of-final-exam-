import type { IncomingMessage, ServerResponse } from 'node:http'
import {
  hashPassword,
  json,
  newSessionToken,
  readJson,
  sessionCookieName,
  setCookie,
} from '../_lib/auth'
import { kvEnvIssue, kvGet, kvSet } from '../_lib/store'

type RegisterBody = { username?: unknown; password?: unknown }

function validateUsername(u: string) {
  return /^[a-zA-Z0-9_]{3,24}$/.test(u)
}

function validatePassword(p: string) {
  return p.length >= 6 && p.length <= 72
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Cache-Control', 'no-store')

  const issue = kvEnvIssue()
  if (issue) return json(res, 500, { ok: false, error: issue })

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return json(res, 405, { ok: false, error: 'METHOD_NOT_ALLOWED' })
  }

  let body: RegisterBody | null = null
  try {
    body = (await readJson(req)) as RegisterBody
  } catch {
    return json(res, 400, { ok: false, error: 'BAD_JSON' })
  }

  const username = String(body?.username ?? '').trim()
  const password = String(body?.password ?? '')

  if (!validateUsername(username)) {
    return json(res, 400, { ok: false, error: 'INVALID_USERNAME' })
  }
  if (!validatePassword(password)) {
    return json(res, 400, { ok: false, error: 'INVALID_PASSWORD' })
  }

  const userKey = `user:${username}`
  const existing = await kvGet(userKey)
  if (existing) return json(res, 409, { ok: false, error: 'USER_EXISTS' })

  const pass = hashPassword(password)
  const user = { username, pass, createdAt: Date.now() }
  await kvSet(userKey, user)

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
