import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

function errorText(code: string) {
  if (code === 'INVALID_USERNAME') return '用户名格式不正确（3-24 位：字母/数字/下划线）'
  if (code === 'INVALID_EMAIL') return '邮箱格式不正确'
  if (code === 'INVALID_EMAIL_DOMAIN') return '请使用 @ad.unsw.edu.au 邮箱'
  if (code === 'INVALID_PASSWORD') return '密码长度需在 6-72 位之间'
  if (code === 'USER_EXISTS') return '该用户名已被注册'
  if (code === 'NETWORK_ERROR') return '网络错误，请稍后重试'
  return `注册失败：${code}`
}

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  return (
    <div className="authShell">
      <div className="authCard">
        <div className="authTop">
          <div className="authBadge authBadgeGreen">NEW</div>
          <div>
            <div className="authTitle">注册</div>
            <div className="authSub">创建账号后会自动登录</div>
          </div>
        </div>

        <div className="divider" />

        <form
          style={{ display: 'grid', gap: 10 }}
          onSubmit={async (e) => {
            e.preventDefault()
            setErr(null)
            setPending(true)
            const r = await register(username, email, password)
            setPending(false)
            if (!r.ok) return setErr(r.error)
            return navigate('/', { replace: true })
          }}
        >
          <div style={{ display: 'grid', gap: 6 }}>
            <div className="muted">用户名</div>
            <input
              className="input"
              value={username}
              autoComplete="username"
              inputMode="text"
              spellCheck={false}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="3-24 位：字母/数字/下划线"
            />
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            <div className="muted">邮箱</div>
            <input
              className="input"
              value={email}
              autoComplete="email"
              inputMode="email"
              spellCheck={false}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yourname@ad.unsw.edu.au"
            />
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            <div className="muted">密码</div>
            <input
              className="input"
              value={password}
              type="password"
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6-72 位"
            />
          </div>

          {err && <div className="muted danger">{errorText(err)}</div>}

          <div className="btnRow" style={{ marginTop: 4 }}>
            <button className="btn btnPrimary" disabled={pending} type="submit">
              {pending ? '正在创建…' : '创建账号'}
            </button>
            <Link className="btn" to="/login">
              去登录
            </Link>
          </div>
        </form>

        <div className="divider" />
        <div className="muted">
          密码会用 scrypt 加盐哈希后存入 KV；会话 token 带过期时间，存入 KV 并写入 Cookie。
        </div>
      </div>
    </div>
  )
}
