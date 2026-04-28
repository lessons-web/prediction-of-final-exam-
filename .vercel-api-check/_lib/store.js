import { Redis } from '@upstash/redis';
export function kvEnvIssue() {
    const url = readUpstashUrl();
    const token = readUpstashToken();
    if (!url)
        return 'KV_REST_API_URL_MISSING';
    if (!token)
        return 'KV_REST_API_TOKEN_MISSING';
    if (!/^https?:\/\//.test(url))
        return 'KV_REST_API_URL_INVALID';
    return null;
}
function stripWrapper(v) {
    return v.trim().replace(/^["'`]+/, '').replace(/["'`]+$/, '');
}
function readUpstashUrl() {
    const raw = process.env.KV_REST_API_URL ??
        process.env.UPSTASH_REDIS_REST_URL ??
        process.env.UPSTASH_REDIS_REST_API_URL ??
        '';
    return stripWrapper(String(raw));
}
function readUpstashToken() {
    const raw = process.env.KV_REST_API_TOKEN ??
        process.env.UPSTASH_REDIS_REST_TOKEN ??
        process.env.UPSTASH_REDIS_REST_API_TOKEN ??
        '';
    return stripWrapper(String(raw));
}
const redis = new Redis({ url: readUpstashUrl(), token: readUpstashToken() });
export async function kvGet(key) {
    return (await redis.get(key));
}
export async function kvSet(key, value, opts) {
    if (typeof opts?.ex === 'number')
        return redis.set(key, value, { ex: opts.ex });
    return redis.set(key, value);
}
export async function kvDel(key) {
    return redis.del(key);
}
