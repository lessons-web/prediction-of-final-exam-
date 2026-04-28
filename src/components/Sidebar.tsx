import { useMemo, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { questionsByGroup } from '../questions'
import type { QuestionGroup } from '../types'

function groupLabel(group: QuestionGroup) {
  return group === 'game1' ? 'Game1（第1题）' : 'Game2（第2题）'
}

function groupHint(group: QuestionGroup) {
  return group === 'game1'
    ? '输入/校验/闭环'
    : '规则/网格/状态机'
}

export function Sidebar() {
  const location = useLocation()
  const { user, loading, logout } = useAuth()
  const activeGroup = useMemo<QuestionGroup | null>(() => {
    const m = location.pathname.match(/^\/(game1|game2)\//)
    return (m?.[1] as QuestionGroup | undefined) ?? null
  }, [location.pathname])

  const [open, setOpen] = useState<Record<QuestionGroup, boolean>>({
    game1: activeGroup ? activeGroup === 'game1' : true,
    game2: activeGroup ? activeGroup === 'game2' : true,
  })

  return (
    <div>
      <div className="accountBox">
        <div className="accountRow">
          <div>
            <div className="accountLabel">账号</div>
            <div className="accountValue">
              {loading ? '验证中…' : user ? user.username : '未登录'}
            </div>
          </div>
          {user ? (
            <button className="accountBtn" onClick={() => void logout()} type="button">
              退出
            </button>
          ) : (
            <Link className="accountBtn accountBtnPrimary" to="/login">
              登录
            </Link>
          )}
        </div>

        {!loading && !user && (
          <div className="accountHintRow">
            <span className="accountHint">需要登录后才可进入题目页</span>
            <Link className="accountLink" to="/register">
              注册
            </Link>
          </div>
        )}
      </div>

      {(Object.keys(questionsByGroup) as QuestionGroup[]).map((g) => {
        const list = questionsByGroup[g]
        const isOpen = open[g]
        return (
          <section className="navSection" key={g}>
            <div
              className="navHeader"
              role="button"
              tabIndex={0}
              onClick={() => setOpen((s) => ({ ...s, [g]: !s[g] }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setOpen((s) => ({ ...s, [g]: !s[g] }))
                }
              }}
            >
              <div className="navHeaderLeft">
                <span className="navPill">{list.length}题</span>
                <div>
                  <div className="navHeaderTitle">{groupLabel(g)}</div>
                  <div className="navHeaderHint">{groupHint(g)}</div>
                </div>
              </div>
              <span className="navHeaderHint">{isOpen ? '收起' : '展开'}</span>
            </div>

            {isOpen && (
              <div className="navList">
                {list.map((q, idx) => (
                  <NavLink
                    key={q.qid}
                    to={`/${q.group}/${q.qid}`}
                    className={({ isActive }) =>
                      `navItem ${isActive ? 'navItemActive' : ''}`
                    }
                    end
                  >
                    <span className="navItemIndex">{idx + 1}</span>
                    <span style={{ fontSize: 13, fontWeight: 650 }}>
                      {q.title}
                    </span>
                  </NavLink>
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
