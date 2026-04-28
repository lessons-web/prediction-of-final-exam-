import type { IncomingMessage, ServerResponse } from 'node:http'
import { clearCookie, cookies, json, sessionCookieName } from '../_lib/auth.js'
import { kvEnvIssue, kvGet } from '../_lib/store.js'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Cache-Control', 'no-store')

  const issue = kvEnvIssue()
  if (issue) return json(res, 500, { ok: false, error: issue })

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return json(res, 405, { ok: false, error: 'METHOD_NOT_ALLOWED' })
  }

  const token = cookies(req)[sessionCookieName]
  if (!token) return json(res, 200, { ok: true, user: null })

  const session = (await kvGet(`sess:${token}`)) as { username: string } | null | undefined
  if (!session?.username) {
    clearCookie(res, sessionCookieName)
    return json(res, 200, { ok: true, user: null })
  }

  return json(res, 200, { ok: true, user: { username: session.username } })
}
