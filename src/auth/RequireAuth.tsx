import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="heroCard">
        <h1 className="h1">正在验证登录态</h1>
        <div className="sub">首次加载会从服务器读取会话（Vercel KV）。</div>
      </div>
    )
  }

  if (!user) {
    const from = location.pathname + location.search
    return <Navigate to="/login" replace state={{ from }} />
  }

  return children
}

