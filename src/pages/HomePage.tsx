import { Link } from 'react-router-dom'
import { questionsByGroup } from '../questions'

export function HomePage() {
  const g1 = questionsByGroup.game1[0]
  const g2 = questionsByGroup.game2[0]
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div className="heroCard">
        <h1 className="h1">COMP6080 Final 押题训练场（React-TS）</h1>
        <div className="sub">
          左侧选择 Game1 / Game2 的题目。右侧展示题面摘要、考点标签与“核心功能演示组件”。
        </div>
        <div className="divider" />
        <div className="btnRow">
          <Link className="btn btnPrimary" to={`/${g1.group}/${g1.qid}`}>
            从 Game1 第1题开始
          </Link>
          <Link className="btn" to={`/${g2.group}/${g2.qid}`}>
            从 Game2 第1题开始
          </Link>
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <div className="cardTitleRow">
            <div className="cardTitle">Game1（第1题）</div>
            <span className="chip chipPurple">10 题</span>
          </div>
          <div className="muted">
            典型特点：输入/点击校验、随机生成、闭环重置、轻量统计。
          </div>
        </div>
        <div className="card">
          <div className="cardTitleRow">
            <div className="cardTitle">Game2（第2题）</div>
            <span className="chip chipGreen">10 题</span>
          </div>
          <div className="muted">
            典型特点：网格与规则、状态机、键盘/计时器、Overlay/统计。
          </div>
        </div>
      </div>
    </div>
  )
}

