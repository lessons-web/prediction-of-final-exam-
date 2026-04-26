import { Navigate, useParams } from 'react-router-dom'
import { getQuestion } from '../questions'

function difficultyChip(d: string) {
  if (d === '基础') return 'chip chipGreen'
  if (d === '提高') return 'chip chipAmber'
  return 'chip chipPurple'
}

export function QuestionPage() {
  const { group, qid } = useParams()
  const q = getQuestion(group, qid)
  if (!q) return <Navigate to="/" replace />

  const Demo = q.Component
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div className="heroCard">
        <h1 className="h1">
          {q.group.toUpperCase()} · {q.qid.toUpperCase()}｜{q.title}
        </h1>
        <div className="chips" style={{ marginTop: 10 }}>
          <span className={difficultyChip(q.difficulty)}>{q.difficulty}</span>
          {q.tags.map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>
        <div className="sub" style={{ marginTop: 10 }}>
          {q.summary}
        </div>
      </div>

      <div className="card">
        <div className="cardTitleRow">
          <div className="cardTitle">题目描述</div>
          <span className="chip">讲义</span>
        </div>
        <div className="muted" style={{ whiteSpace: 'pre-wrap' }}>
          {q.prompt}
        </div>
      </div>

      <div className="card">
        <div className="cardTitleRow">
          <div className="cardTitle">本题考查知识点</div>
        </div>
        <div className="chips">
          {q.knowledge.map((k) => (
            <span key={k} className="chip">
              {k}
            </span>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="cardTitleRow">
          <div className="cardTitle">演示（核心组件 + 功能展示）</div>
          <span className="chip">Demo / 作业参考</span>
        </div>
        <Demo />
      </div>
    </div>
  )
}
