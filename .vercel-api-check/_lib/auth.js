import crypto from 'node:crypto';
export const sessionCookieName = 'comp6080_session';
export async function readJson(req) {
    const chunks = [];
    for await (const c of req)
        chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c));
    const raw = Buffer.concat(chunks).toString('utf8').trim();
    if (!raw)
        return null;
    return JSON.parse(raw);
}
export function json(res, status, data) {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(data));
}
export function cookies(req) {
    const header = String(req.headers.cookie ?? '');
    const out = {};
    for (const part of header.split(';')) {
        const p = part.trim();
        if (!p)
            continue;
        const idx = p.indexOf('=');
        if (idx <= 0)
            continue;
        const k = p.slice(0, idx).trim();
        const v = p.slice(idx + 1).trim();
        if (!k)
            continue;
        out[k] = decodeURIComponent(v);
    }
    return out;
}
export function setCookie(res, name, value, opts) {
    const parts = [`${name}=${encodeURIComponent(value)}`];
    parts.push(`Path=${opts.path ?? '/'}`);
    if (opts.httpOnly)
        parts.push('HttpOnly');
    if (opts.secure)
        parts.push('Secure');
    if (opts.sameSite)
        parts.push(`SameSite=${opts.sameSite}`);
    if (typeof opts.maxAge === 'number')
        parts.push(`Max-Age=${opts.maxAge}`);
    res.setHeader('Set-Cookie', parts.join('; '));
}
export function clearCookie(res, name) {
    setCookie(res, name, '', { path: '/', httpOnly: true, sameSite: 'Lax', maxAge: 0 });
}
export function newSessionToken() {
    return crypto.randomBytes(32).toString('base64url');
}
export function hashPassword(password) {
    const salt = crypto.randomBytes(16);
    const hash = crypto.scryptSync(password, salt, 64);
    return { salt: salt.toString('base64'), hash: hash.toString('base64') };
}
export function verifyPassword(password, stored) {
    const salt = Buffer.from(stored.salt, 'base64');
    const expected = Buffer.from(stored.hash, 'base64');
    const actual = crypto.scryptSync(password, salt, expected.length);
    return crypto.timingSafeEqual(expected, actual);
}
