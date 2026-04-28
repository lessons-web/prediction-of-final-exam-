import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

function errorText(code: string) {
  if (code === 'INVALID_CREDENTIALS') return '用户名或密码不正确'
  if (code === 'NETWORK_ERROR') return '网络错误，请稍后重试'
  if (code === 'MISSING') return '请输入用户名与密码'
  return `登录失败：${code}`
}

export function LoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = useMemo(() => {
    const s = location.state as { from?: string } | null
    return s?.from ?? '/'
  }, [location.state])

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  if (user) {
    return (
      <div style={{ display: 'grid', gap: 14 }}>
        <div className="heroCard">
          <h1 className="h1">你已登录</h1>
          <div className="sub">当前账号：{user.username}</div>
          <div className="divider" />
          <div className="btnRow">
            <button className="btn btnPrimary" onClick={() => navigate(from, { replace: true })}>
              返回继续训练
            </button>
            <Link className="btn" to="/">
              回首页
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="authShell">
      <div className="authCard">
        <div className="authTop">
          <div className="authBadge">KV</div>
          <div>
            <div className="authTitle">登录</div>
            <div className="authSub">进入押题训练场（会话存储：Vercel KV）</div>
          </div>
        </div>

        <div className="divider" />

        <form
          style={{ display: 'grid', gap: 10 }}
          onSubmit={async (e) => {
            e.preventDefault()
            setErr(null)
            setPending(true)
            const r = await login(username, password)
            setPending(false)
            if (!r.ok) return setErr(r.error)
            return navigate(from, { replace: true })
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
            <div className="muted">密码</div>
            <input
              className="input"
              value={password}
              type="password"
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 6 位"
            />
          </div>

          {err && <div className="muted danger">{errorText(err)}</div>}

          <div className="btnRow" style={{ marginTop: 4 }}>
            <button className="btn btnPrimary" disabled={pending} type="submit">
              {pending ? '正在登录…' : '登录'}
            </button>
            <Link className="btn" to="/register">
              去注册
            </Link>
          </div>
        </form>

        <div className="divider" />
        <div className="muted">
          提示：登录后会以 HttpOnly Cookie 形式保存会话，不会暴露在 localStorage。
        </div>
      </div>
    </div>
  )
}

