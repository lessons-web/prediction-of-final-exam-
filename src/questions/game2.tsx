import { useEffect, useRef, useState } from 'react'
import type { QuestionDef } from '../types'
import { lsGet, lsSet, randomInt, shuffle } from '../lib/utils'

function MiniTitle({ children }: { children: string }) {
  return <div style={{ fontWeight: 800, marginBottom: 8 }}>{children}</div>
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="btnRow">{children}</div>
}

// -------------------------
// G2-Q1 基础｜3×3 Slide Swap
function makeShuffled3x3() {
  const arr = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 0])
  return arr
}

function isAdjacent3x3(a: number, b: number) {
  const ra = Math.floor(a / 3)
  const ca = a % 3
  const rb = Math.floor(b / 3)
  const cb = b % 3
  return Math.abs(ra - rb) + Math.abs(ca - cb) === 1
}

function G2Q1() {
  const [cells, setCells] = useState<number[]>(() => makeShuffled3x3())
  const empty = cells.indexOf(0)

  function reset() {
    setCells(makeShuffled3x3())
  }

  function click(i: number) {
    if (!isAdjacent3x3(i, empty)) return
    const next = [...cells]
    ;[next[i], next[empty]] = [next[empty], next[i]]
    setCells(next)
  }

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <MiniTitle>3×3 Slide Swap（相邻交换）</MiniTitle>
      <div className="muted">典型考点：网格渲染、相邻判定、交换更新、Reset。</div>
      <div className="card" style={{ background: 'rgba(0,0,0,0.14)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, maxWidth: 320 }}>
          {cells.map((v, i) => (
            <button
              key={i}
              className="btn"
              onClick={() => click(i)}
              style={{
                height: 78,
                fontSize: 22,
                fontWeight: 900,
                background: v === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.25)',
                opacity: v === 0 ? 0.5 : 1,
              }}
            >
              {v === 0 ? '' : v}
            </button>
          ))}
        </div>
        <div className="divider" />
        <Row>
          <button className="btn btnPrimary" onClick={reset}>
            Reset（打乱）
          </button>
          <span className="muted">空格 = 0（点击相邻块才会移动）</span>
        </Row>
      </div>
    </div>
  )
}

// -------------------------
// G2-Q2 基础｜TicTacToe Core
type TTCell = 'O' | 'X' | ''
const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

function winnerTT(b: TTCell[]) {
  for (const [a, c, d] of LINES) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a]
  }
  return null
}

function G2Q2() {
  const [b, setB] = useState<TTCell[]>(() => Array(9).fill(''))
  const [turn, setTurn] = useState<'O' | 'X'>('O')
  const [done, setDone] = useState(false)
  const w = winnerTT(b)
  const isDraw = !w && b.every(Boolean)

  function reset() {
    setB(Array(9).fill(''))
    setTurn('O')
    setDone(false)
  }

  function play(i: number) {
    if (done || b[i]) return
    const next = [...b]
    next[i] = turn
    setB(next)
    const nw = winnerTT(next)
    const ndraw = !nw && next.every(Boolean)
    if (nw || ndraw) setDone(true)
    else setTurn((t) => (t === 'O' ? 'X' : 'O'))
  }

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <MiniTitle>TicTacToe Core（回合 + 胜负 + Overlay）</MiniTitle>
      <div className="muted">典型考点：网格、回合状态、胜负判定、Overlay 锁定与重开。</div>

      <div className="card" style={{ background: 'rgba(0,0,0,0.14)' }}>
        <div className="chips">
          <span className="chip chipAmber">Turn: {turn}</span>
          <span className="chip">Win condition: 3 in a row</span>
        </div>
        <div className="divider" />
        <div style={{ position: 'relative', width: 330 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {b.map((v, i) => (
              <button
                key={i}
                className="btn"
                onClick={() => play(i)}
                style={{
                  height: 96,
                  fontSize: 34,
                  fontWeight: 900,
                  background: 'rgba(0,0,0,0.22)',
                }}
              >
                {v}
              </button>
            ))}
          </div>

          {(done || w || isDraw) && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 16,
                display: 'grid',
                placeItems: 'center',
                background: 'rgba(0,0,0,0.55)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <div className="card" style={{ width: 260 }}>
                <div style={{ fontWeight: 900, fontSize: 16 }}>
                  {w ? `${w} wins` : 'No one wins'}
                </div>
                <div className="muted" style={{ marginTop: 6 }}>
                  A total of {b.filter(Boolean).length} moves were made.
                </div>
                <div className="divider" />
                <button className="btn btnPrimary" onClick={reset} style={{ width: '100%' }}>
                  Play again
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="divider" />
        <Row>
          <button className="btn" onClick={reset}>
            Reset
          </button>
        </Row>
      </div>
    </div>
  )
}

// -------------------------
// G2-Q3 提高｜Connect4 Mini（6×7）
type P = 0 | 1 | 2
function emptyGrid() {
  return Array.from({ length: 6 }, () => Array.from({ length: 7 }, () => 0 as P))
}

function checkConnect4(grid: P[][], lastR: number, lastC: number) {
  const who = grid[lastR]?.[lastC] ?? 0
  if (!who) return false
  const dirs = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1],
  ]
  for (const [dr, dc] of dirs) {
    let cnt = 1
    for (const s of [-1, 1] as const) {
      let r = lastR + dr * s
      let c = lastC + dc * s
      while (r >= 0 && r < 6 && c >= 0 && c < 7 && grid[r][c] === who) {
        cnt++
        r += dr * s
        c += dc * s
      }
    }
    if (cnt >= 4) return true
  }
  return false
}

function G2Q3() {
  const [grid, setGrid] = useState<P[][]>(() => emptyGrid())
  const [turn, setTurn] = useState<1 | 2>(1)
  const [winner, setWinner] = useState<P>(0)
  const [moves, setMoves] = useState(0)

  function reset() {
    setGrid(emptyGrid())
    setTurn(1)
    setWinner(0)
    setMoves(0)
  }

  function drop(col: number) {
    if (winner) return
    // find from bottom
    let row = -1
    for (let r = 5; r >= 0; r--) {
      if (grid[r][col] === 0) {
        row = r
        break
      }
    }
    if (row === -1) return
    const next = grid.map((r) => [...r]) as P[][]
    next[row][col] = turn
    const nextMoves = moves + 1
    setGrid(next)
    setMoves(nextMoves)
    if (checkConnect4(next, row, col)) {
      setWinner(turn)
      return
    }
    setTurn((t) => (t === 1 ? 2 : 1))
  }

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <MiniTitle>Connect4 Mini（落子到底 + 四连检测）</MiniTitle>
      <div className="muted">典型考点：二维数组、落子规则、从最后一步做四连检测。</div>

      <div className="card" style={{ background: 'rgba(0,0,0,0.14)' }}>
        <div className="chips">
          <span className="chip chipAmber">Turn: P{turn}</span>
          <span className="chip">Moves: {moves}</span>
          {winner ? <span className="chip chipGreen">Winner: P{winner}</span> : <span className="chip">—</span>}
        </div>
        <div className="divider" />
        <div style={{ display: 'grid', gap: 10 }}>
          <div className="btnRow" style={{ gap: 8 }}>
            {Array.from({ length: 7 }).map((_, c) => (
              <button key={c} className="btn" onClick={() => drop(c)} style={{ padding: '8px 10px' }}>
                ↓ {c + 1}
              </button>
            ))}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 44px)',
              gap: 8,
              padding: 10,
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.10)',
              background: 'rgba(0,0,0,0.22)',
              width: 'fit-content',
            }}
          >
            {grid.flatMap((row, r) =>
              row.map((cell, c) => {
                const color = cell === 0 ? 'transparent' : cell === 1 ? '#60a5fa' : '#f87171'
                return (
                  <div
                    key={`${r}-${c}`}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 999,
                      border: '1px solid rgba(255,255,255,0.14)',
                      background: 'rgba(255,255,255,0.04)',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 999,
                        background: color,
                        boxShadow: cell ? '0 10px 20px rgba(0,0,0,0.25)' : 'none',
                      }}
                    />
                  </div>
                )
              })
            )}
          </div>
          {winner && <div style={{ color: '#bbf7d0', fontWeight: 900 }}>P{winner} wins!</div>}
        </div>
        <div className="divider" />
        <Row>
          <button className="btn btnPrimary" onClick={reset}>
            Reset
          </button>
        </Row>
      </div>
    </div>
  )
}

// -------------------------
// G2-Q4 提高｜Aim Trainer（计时 + 每秒目标）
type Pos = { r: number; c: number }
function G2Q4() {
  const [screen, setScreen] = useState<'onboarding' | 'playing' | 'result'>('onboarding')
  const [timeLimit, setTimeLimit] = useState('10')
  const [goal, setGoal] = useState('5')
  const [timeLeft, setTimeLeft] = useState(10)
  const [goalN, setGoalN] = useState(5)
  const [hit, setHit] = useState(0)
  const [miss, setMiss] = useState(0)
  const [target, setTarget] = useState<Pos | null>(null)
  const [lastAcc, setLastAcc] = useState<number | null>(null)
  const tickRef = useRef<number | null>(null)
  const spawnRef = useRef<number | null>(null)

  function cleanTimers() {
    if (tickRef.current) window.clearInterval(tickRef.current)
    if (spawnRef.current) window.clearInterval(spawnRef.current)
    tickRef.current = null
    spawnRef.current = null
  }

  function start() {
    const t = Number(timeLimit) || 10
    const g = Number(goal) || 5
    setGoalN(g)
    setTimeLeft(t)
    setHit(0)
    setMiss(0)
    setTarget({ r: randomInt(0, 9), c: randomInt(0, 9) })
    setScreen('playing')
  }

  useEffect(() => {
    cleanTimers()
    if (screen !== 'playing') return
    tickRef.current = window.setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          window.setTimeout(() => setScreen('result'), 0)
          return 0
        }
        return s - 1
      })
    }, 1000)
    spawnRef.current = window.setInterval(() => {
      setTarget({ r: randomInt(0, 9), c: randomInt(0, 9) })
    }, 1000)
    return cleanTimers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen])

  useEffect(() => {
    if (screen !== 'result') return
    cleanTimers()
    const total = hit + miss
    const acc = total === 0 ? 0 : (hit / total) * 100
    setLastAcc(Math.round(acc * 100) / 100)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen])

  const won = hit >= goalN

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <MiniTitle>Aim Trainer（Onboarding → Playing → Result）</MiniTitle>
      <div className="muted">典型考点：表单默认值、倒计时、每秒刷目标、命中率统计、可连续游玩。</div>

      <div className="card" style={{ background: 'rgba(0,0,0,0.14)' }}>
        {screen === 'onboarding' && (
          <div style={{ display: 'grid', gap: 10, maxWidth: 420 }}>
            <label className="muted">Time Limit (seconds)</label>
            <input className="input" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} />
            <label className="muted">Goal</label>
            <input className="input" value={goal} onChange={(e) => setGoal(e.target.value)} />
            <button className="btn btnPrimary" onClick={start}>
              START
            </button>
            {lastAcc != null && <div className="muted">Accuracy of your previous game: {lastAcc}%</div>}
          </div>
        )}

        {screen === 'playing' && (
          <div style={{ display: 'grid', gap: 10 }}>
            <div className="chips">
              <span className="chip chipAmber">Time left: {timeLeft}s</span>
              <span className="chip chipGreen">Hit: {hit}/{goalN}</span>
              <span className="chip">Miss: {miss}</span>
            </div>
            <div className="divider" />
            <div
              onClick={() => setMiss((m) => m + 1)}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(10, 1fr)',
                gap: 8,
                borderRadius: 16,
                padding: 10,
                border: '1px solid rgba(255,255,255,0.10)',
                background: 'rgba(0,0,0,0.22)',
                maxWidth: 560,
              }}
            >
              {Array.from({ length: 100 }).map((_, i) => {
                const r = Math.floor(i / 10)
                const c = i % 10
                const isTarget = target?.r === r && target?.c === c
                return (
                  <button
                    key={i}
                    className="btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!isTarget) return
                      setHit((h) => h + 1)
                      setTarget(null)
                    }}
                    style={{
                      height: 38,
                      padding: 0,
                      borderRadius: 12,
                      background: isTarget ? 'rgba(239,68,68,0.22)' : 'rgba(255,255,255,0.04)',
                      borderColor: isTarget ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.10)',
                    }}
                    aria-label={isTarget ? 'target' : 'cell'}
                  >
                    {isTarget ? '●' : ''}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {screen === 'result' && (
          <div style={{ display: 'grid', gap: 10 }}>
            <div style={{ fontWeight: 900, color: won ? '#bbf7d0' : '#fecaca' }}>
              {won ? 'You have won' : 'You have lost'}
            </div>
            <div className="muted">
              Hit: {hit} ｜ Miss: {miss} ｜ Goal: {goalN}
            </div>
            <Row>
              <button className="btn btnPrimary" onClick={() => setScreen('onboarding')}>
                Back to onboarding
              </button>
            </Row>
          </div>
        )}
      </div>
    </div>
  )
}

// -------------------------
// G2-Q5 提高｜Tower of Hanoi
type Tower = number[] // smaller number = smaller disk
function initTowers(n: number): Tower[] {
  return [[...Array(n)].map((_, i) => n - i), [], []]
}

function G2Q5() {
  const [n, setN] = useState<3 | 4 | 5>(3)
  const [towers, setTowers] = useState<Tower[]>(() => initTowers(3))
  const [from, setFrom] = useState<number | null>(null)
  const [moves, setMoves] = useState(0)
  const [won, setWon] = useState(false)

  function reset(nn = n) {
    setTowers(initTowers(nn))
    setFrom(null)
    setMoves(0)
    setWon(false)
  }

  useEffect(() => {
    reset(3)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function pickTower(i: number) {
    if (won) return
    if (from == null) {
      if (towers[i].length === 0) return
      setFrom(i)
      return
    }
    if (from === i) {
      setFrom(null)
      return
    }
    const src = towers[from]
    const dst = towers[i]
    if (src.length === 0) return
    const disk = src[src.length - 1]
    const top = dst[dst.length - 1]
    if (top && top < disk) return // illegal
    const next = towers.map((t) => [...t]) as Tower[]
    next[from].pop()
    next[i].push(disk)
    setTowers(next)
    setMoves((m) => m + 1)
    setFrom(null)
    if (next[2].length === n) setWon(true)
  }

  function startWith(nn: 3 | 4 | 5) {
    setN(nn)
    reset(nn)
  }

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <MiniTitle>Tower of Hanoi（规则约束 + 步数 + 胜利判定）</MiniTitle>
      <div className="muted">典型考点：栈数据结构、合法移动、from→to 交互、胜利条件。</div>

      <div className="card" style={{ background: 'rgba(0,0,0,0.14)' }}>
        <div className="chips">
          <span className="chip chipAmber">Disks: {n}</span>
          <span className="chip">Moves: {moves}</span>
          {won && <span className="chip chipGreen">Success!</span>}
          {from != null && <span className="chip chipPurple">From: Tower {from + 1}</span>}
        </div>
        <div className="divider" />
        <Row>
          {[3, 4, 5].map((x) => (
            <button key={x} className="btn btnPrimary" onClick={() => startWith(x as any)}>
              Start {x}
            </button>
          ))}
          <button className="btn" onClick={() => reset(n)}>
            Reset
          </button>
        </Row>
        <div className="divider" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, maxWidth: 720 }}>
          {towers.map((t, i) => (
            <button
              key={i}
              className="btn"
              onClick={() => pickTower(i)}
              style={{
                height: 220,
                padding: 12,
                borderRadius: 16,
                background:
                  from === i ? 'rgba(124,58,237,0.16)' : 'rgba(0,0,0,0.22)',
                borderColor: from === i ? 'rgba(124,58,237,0.38)' : 'rgba(255,255,255,0.10)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                gap: 8,
              }}
              aria-label={`tower-${i + 1}`}
            >
              <div className="muted" style={{ alignSelf: 'flex-start' }}>
                Tower {i + 1}
              </div>
              {t.map((disk, idx) => (
                <div
                  key={`${disk}-${idx}`}
                  style={{
                    height: 14,
                    borderRadius: 999,
                    background:
                      disk % 3 === 0
                        ? 'rgba(34,197,94,0.35)'
                        : disk % 3 === 1
                          ? 'rgba(124,58,237,0.35)'
                          : 'rgba(245,158,11,0.35)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    width: `${20 + disk * 14}px`,
                    alignSelf: 'center',
                  }}
                />
              ))}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// -------------------------
// G2-Q6 提高｜Flashing Memory
const LETTERS = ['A', 'B', 'C', 'D'] as const
type Letter = (typeof LETTERS)[number]

function G2Q6() {
  const [round, setRound] = useState(1)
  const [phase, setPhase] = useState<'show' | 'input'>('show')
  const [seq, setSeq] = useState<Letter[]>([])
  const [cursor, setCursor] = useState(0)
  const [flash, setFlash] = useState<Letter | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  function reset() {
    setRound(1)
    setPhase('show')
    setSeq([])
    setCursor(0)
    setFlash(null)
    setMsg(null)
  }

  function nextRound(r: number) {
    const s: Letter[] = Array.from({ length: r }, () => LETTERS[randomInt(0, 3)])
    setSeq(s)
    setCursor(0)
    setPhase('show')
    setMsg(null)
  }

  useEffect(() => {
    nextRound(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (phase !== 'show') return
    let i = 0
    setFlash(null)
    const step = () => {
      if (i >= seq.length) {
        setFlash(null)
        setPhase('input')
        return
      }
      const ch = seq[i]
      setFlash(ch)
      window.setTimeout(() => {
        setFlash(null)
        i++
        window.setTimeout(step, 120)
      }, 600)
    }
    const t = window.setTimeout(step, 400)
    return () => window.clearTimeout(t)
  }, [phase, seq])

  function press(l: Letter) {
    if (phase !== 'input') return
    if (l !== seq[cursor]) {
      setMsg('Wrong! 重新开始')
      window.setTimeout(reset, 900)
      return
    }
    const nextCursor = cursor + 1
    if (nextCursor >= seq.length) {
      if (round >= 5) {
        setMsg('Congratulations!（完成 5 轮）')
        window.setTimeout(reset, 1200)
        return
      }
      const nr = round + 1
      setRound(nr)
      setMsg(`Correct! 进入第 ${nr} 轮…`)
      window.setTimeout(() => nextRound(nr), 700)
      return
    }
    setCursor(nextCursor)
  }

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <MiniTitle>Flashing Memory（X=1..5 阶段序列）</MiniTitle>
      <div className="muted">典型考点：多阶段状态机、禁用/启用、序列播放、用户输入比对。</div>
      <div className="card" style={{ background: 'rgba(0,0,0,0.14)', maxWidth: 560 }}>
        <div className="chips">
          <span className="chip chipAmber">Round: {round}/5</span>
          <span className="chip">{phase === 'show' ? 'Showing…（按钮禁用）' : `Input：第 ${cursor + 1}/${seq.length} 个`}</span>
        </div>
        <div className="divider" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {LETTERS.map((l) => {
            const isFlash = flash === l
            return (
              <button
                key={l}
                className="btn"
                disabled={phase !== 'input'}
                onClick={() => press(l)}
                style={{
                  height: 64,
                  fontWeight: 900,
                  fontSize: 18,
                  background: isFlash ? 'rgba(124,58,237,0.35)' : 'rgba(0,0,0,0.22)',
                  borderColor: isFlash ? 'rgba(124,58,237,0.7)' : 'rgba(255,255,255,0.12)',
                  opacity: phase === 'input' ? 1 : 0.6,
                }}
              >
                {l}
              </button>
            )
          })}
        </div>
        <div style={{ marginTop: 10 }} className="muted">
          提示（debug）：序列 = {seq.join(' ')}
        </div>
        {msg && <div style={{ marginTop: 10 }} className={msg.startsWith('Wrong') ? 'danger' : ''}>{msg}</div>}
      </div>
    </div>
  )
}

// -------------------------
// G2-Q7 冲刺｜Keyboard Grid Runner（简化蛇）
type Dir = 'R' | 'L' | 'U' | 'D'
function move(pos: Pos, dir: Dir) {
  if (dir === 'R') return { r: pos.r, c: pos.c + 1 }
  if (dir === 'L') return { r: pos.r, c: pos.c - 1 }
  if (dir === 'U') return { r: pos.r - 1, c: pos.c }
  return { r: pos.r + 1, c: pos.c }
}

function eq(a: Pos, b: Pos) {
  return a.r === b.r && a.c === b.c
}

function randomFood(occupied: Pos[]) {
  while (true) {
    const p = { r: randomInt(0, 9), c: randomInt(0, 9) }
    if (!occupied.some((o) => eq(o, p))) return p
  }
}

function G2Q7() {
  const [status, setStatus] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle')
  const [snake, setSnake] = useState<Pos[]>([{ r: 0, c: 0 }, { r: 0, c: 1 }])
  const [dir, setDir] = useState<Dir>('R')
  const [food, setFood] = useState<Pos>(() => ({ r: 5, c: 5 }))
  const [score, setScore] = useState(0)
  const tickRef = useRef<number | null>(null)

  function reset() {
    setStatus('idle')
    setSnake([{ r: 0, c: 0 }, { r: 0, c: 1 }])
    setDir('R')
    setScore(0)
    setFood({ r: 5, c: 5 })
  }

  function start() {
    setStatus('playing')
    setSnake([{ r: 0, c: 0 }, { r: 0, c: 1 }])
    setDir('R')
    setScore(0)
    setFood(randomFood([{ r: 0, c: 0 }, { r: 0, c: 1 }]))
  }

  useEffect(() => {
    if (tickRef.current) window.clearInterval(tickRef.current)
    tickRef.current = null
    if (status !== 'playing') return
    tickRef.current = window.setInterval(() => {
      setSnake((prev) => {
        const head = prev[prev.length - 1]
        const nextHead = move(head, dir)
        // wall
        if (nextHead.r < 0 || nextHead.r > 9 || nextHead.c < 0 || nextHead.c > 9) {
          window.setTimeout(() => setStatus('lost'), 0)
          return prev
        }
        // self
        if (prev.some((p) => eq(p, nextHead))) {
          window.setTimeout(() => setStatus('lost'), 0)
          return prev
        }

        const eat = eq(nextHead, food)
        const next = eat ? [...prev, nextHead] : [...prev.slice(1), nextHead]
        if (eat) {
          setScore((s) => {
            const ns = s + 1
            if (ns >= 10) window.setTimeout(() => setStatus('won'), 0)
            return ns
          })
          setFood(randomFood(next))
        }
        return next
      })
    }, 500)
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current)
      tickRef.current = null
    }
  }, [status, dir, food])

  useEffect(() => {
    if (status !== 'playing') return
    const onKey = (e: KeyboardEvent) => {
      const k = e.key
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(k)) return
      e.preventDefault()
      setDir((d) => {
        if (k === 'ArrowUp') return d === 'D' ? d : 'U'
        if (k === 'ArrowDown') return d === 'U' ? d : 'D'
        if (k === 'ArrowLeft') return d === 'R' ? d : 'L'
        return d === 'L' ? d : 'R'
      })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [status])

  const overlay = status === 'won' ? 'Congratulations!' : status === 'lost' ? 'Oh no!' : null

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <MiniTitle>Keyboard Runner（方向键 + tick + 碰撞）</MiniTitle>
      <div className="muted">典型考点：keydown 监听、tick interval、碰撞判定、结束 Overlay。</div>

      <div className="card" style={{ background: 'rgba(0,0,0,0.14)' }}>
        <div className="chips">
          <span className="chip chipGreen">Score: {score}/10</span>
          <span className="chip">Dir: {dir}</span>
          <span className="chip">用方向键控制</span>
        </div>
        <div className="divider" />
        <div style={{ position: 'relative', width: 420 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(10, 1fr)',
              gap: 6,
              padding: 10,
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.10)',
              background: 'rgba(0,0,0,0.22)',
            }}
          >
            {Array.from({ length: 100 }).map((_, i) => {
              const r = Math.floor(i / 10)
              const c = i % 10
              const isSnake = snake.some((p) => p.r === r && p.c === c)
              const isFood = food.r === r && food.c === c
              return (
                <div
                  key={i}
                  style={{
                    height: 30,
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.06)',
                    background: isFood
                      ? 'rgba(245,158,11,0.25)'
                      : isSnake
                        ? 'rgba(34,197,94,0.28)'
                        : 'rgba(255,255,255,0.03)',
                  }}
                />
              )
            })}
          </div>

          {overlay && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
                background: 'rgba(0,0,0,0.55)',
                borderRadius: 16,
              }}
            >
              <div className="card" style={{ width: 260 }}>
                <div style={{ fontWeight: 900 }}>{overlay}</div>
                <div className="muted" style={{ marginTop: 6 }}>
                  Score: {score}
                </div>
                <div className="divider" />
                <button className="btn btnPrimary" style={{ width: '100%' }} onClick={start}>
                  Play again
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="divider" />
        <Row>
          {status !== 'playing' ? (
            <button className="btn btnPrimary" onClick={start}>
              Start
            </button>
          ) : (
            <button className="btn" onClick={reset}>
              Stop
            </button>
          )}
          <button className="btn" onClick={reset}>
            Reset
          </button>
        </Row>
      </div>
    </div>
  )
}

// -------------------------
// G2-Q8 冲刺｜Overlay Animation（3 秒闪烁）
function G2Q8() {
  const [status, setStatus] = useState<'idle' | 'anim' | 'overlay'>('idle')
  const [flash, setFlash] = useState(false)
  const iRef = useRef<number | null>(null)
  const tRef = useRef<number | null>(null)

  function start() {
    setStatus('anim')
  }

  function reset() {
    if (iRef.current) window.clearInterval(iRef.current)
    if (tRef.current) window.clearTimeout(tRef.current)
    iRef.current = null
    tRef.current = null
    setFlash(false)
    setStatus('idle')
  }

  useEffect(() => {
    if (status !== 'anim') return
    iRef.current = window.setInterval(() => setFlash((f) => !f), 500)
    tRef.current = window.setTimeout(() => {
      if (iRef.current) window.clearInterval(iRef.current)
      iRef.current = null
      setStatus('overlay')
    }, 3000)
    return reset
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <MiniTitle>Overlay Animation（3 秒闪烁 + 交互锁定）</MiniTitle>
      <div className="muted">典型考点：动画期间禁用输入，动画结束再展示 Overlay。</div>

      <div className="card" style={{ background: 'rgba(0,0,0,0.14)' }}>
        <div className="muted">点击 Start 触发：每 0.5s 闪烁一次，持续 3 秒，然后出现 Overlay。</div>
        <div className="divider" />

        <div
          style={{
            position: 'relative',
            height: 170,
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.10)',
            background: flash ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.22)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <div className="muted">内容区域（动画期间不可交互）</div>
          {status === 'overlay' && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
                background: 'rgba(0,0,0,0.55)',
                borderRadius: 16,
              }}
            >
              <div className="card" style={{ width: 260 }}>
                <div style={{ fontWeight: 900 }}>Animation done</div>
                <div className="muted" style={{ marginTop: 6 }}>
                  现在可以显示结果并提供 Play again。
                </div>
                <div className="divider" />
                <button className="btn btnPrimary" style={{ width: '100%' }} onClick={reset}>
                  Play again
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="divider" />
        <Row>
          <button className="btn btnPrimary" onClick={start} disabled={status !== 'idle'}>
            Start
          </button>
          <button className="btn" onClick={reset}>
            Reset
          </button>
        </Row>
      </div>
    </div>
  )
}

// -------------------------
// G2-Q9 冲刺｜Stats Panel（schema + 展示）
type GlobalStats = {
  games: Record<string, { played: number; totalTimeSec: number; best: number | null }>
}
const STATS_KEY = 'global.stats.demo'

function ensureStats(): GlobalStats {
  return lsGet<GlobalStats>(STATS_KEY, {
    games: {
      game1: { played: 0, totalTimeSec: 0, best: null },
      game2: { played: 0, totalTimeSec: 0, best: null },
      extra: { played: 0, totalTimeSec: 0, best: null },
    },
  })
}

function G2Q9() {
  const [stats, setStats] = useState<GlobalStats>(() => ensureStats())

  function bump(key: string) {
    const s = ensureStats()
    const g = s.games[key] ?? { played: 0, totalTimeSec: 0, best: null }
    const spent = randomInt(6, 80)
    const score = randomInt(1, 999)
    const best = g.best == null ? score : Math.max(g.best, score)
    s.games[key] = { played: g.played + 1, totalTimeSec: g.totalTimeSec + spent, best }
    lsSet(STATS_KEY, s)
    setStats(s)
  }

  function clear() {
    const s: GlobalStats = { games: {} }
    lsSet(STATS_KEY, s)
    setStats(ensureStats())
  }

  const rows = Object.entries(stats.games).map(([k, v]) => {
    const avg = v.played === 0 ? 0 : v.totalTimeSec / v.played
    return { k, ...v, avg: Math.round(avg * 100) / 100 }
  })

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <MiniTitle>Stats Panel（聚合展示：played / avgTime / best）</MiniTitle>
      <div className="muted">典型考点：先定 schema，再在各游戏结束处更新，最后统一展示。</div>

      <div className="card" style={{ background: 'rgba(0,0,0,0.14)' }}>
        <div className="muted">这里用“模拟按钮”演示 Stats 的数据结构与更新方式。</div>
        <div className="divider" />
        <Row>
          <button className="btn btnPrimary" onClick={() => bump('game1')}>
            模拟 Game1 完成一局
          </button>
          <button className="btn btnPrimary" onClick={() => bump('game2')}>
            模拟 Game2 完成一局
          </button>
          <button className="btn" onClick={() => bump('extra')}>
            模拟 Extra
          </button>
          <button className="btn btnDanger" onClick={clear}>
            清空
          </button>
        </Row>
        <div className="divider" />
        <div style={{ display: 'grid', gap: 10 }}>
          {rows.map((r) => (
            <div key={r.k} className="card" style={{ background: 'rgba(0,0,0,0.18)' }}>
              <div className="cardTitleRow">
                <div className="cardTitle">{r.k}</div>
                <div className="chips">
                  <span className="chip">played: {r.played}</span>
                  <span className="chip chipAmber">avg: {r.avg}s</span>
                  <span className="chip chipGreen">best: {r.best ?? '-'}</span>
                </div>
              </div>
              <div className="muted">
                totalTime = {r.totalTimeSec}s（avg = totalTime / played）
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// -------------------------
// G2-Q10 冲刺｜Puzzle + Keyboard + Solve（综合）
const SOLVED = [1, 2, 3, 4, 5, 6, 7, 8, 0]

function G2Q10() {
  const [active, setActive] = useState(false)
  const [cells, setCells] = useState<number[]>(() => makeShuffled3x3())
  const [solved, setSolved] = useState(false)
  const [moved, setMoved] = useState(false)
  const empty = cells.indexOf(0)

  function reset() {
    setCells(makeShuffled3x3())
    setSolved(false)
    setMoved(false)
    setActive(false)
  }

  function solve() {
    setCells(SOLVED)
    setSolved(true)
  }

  function swap(i: number) {
    if (solved) return
    if (!isAdjacent3x3(i, empty)) return
    const next = [...cells]
    ;[next[i], next[empty]] = [next[empty], next[i]]
    setCells(next)
    setMoved(true)
    if (next.every((v, idx) => v === SOLVED[idx])) setSolved(true)
  }

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, number> = {
        ArrowUp: 3,
        ArrowDown: -3,
        ArrowLeft: 1,
        ArrowRight: -1,
      }
      if (!(e.key in map)) return
      e.preventDefault()
      // Move empty opposite direction so that "press up" moves tile down into empty (intuitive can vary)
      const delta = map[e.key]
      const target = empty + delta
      if (target < 0 || target > 8) return
      // guard wrap rows for left/right
      if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && Math.floor(target / 3) !== Math.floor(empty / 3)) return
      swap(target)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, empty, cells, solved])

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <MiniTitle>Puzzle 综合（Active + 键盘 + Solve/Reset 状态）</MiniTitle>
      <div className="muted">典型考点：active 机制、方向键移动、Solve 禁用、Reset 启用条件等。</div>

      <div className="card" style={{ background: 'rgba(0,0,0,0.14)' }}>
        <div className="chips">
          <span className="chip chipAmber">Active: {active ? 'Yes' : 'No'}</span>
          <span className="chip">Moved: {moved ? 'Yes' : 'No'}</span>
          {solved ? <span className="chip chipGreen">Solved</span> : <span className="chip">Playing</span>}
        </div>
        <div className="divider" />
        <div
          onClick={() => setActive(true)}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10,
            maxWidth: 320,
            padding: 10,
            borderRadius: 16,
            border: active ? '1px solid rgba(124,58,237,0.45)' : '1px solid rgba(255,255,255,0.10)',
            background: active ? 'rgba(124,58,237,0.08)' : 'rgba(0,0,0,0.22)',
          }}
          role="button"
          tabIndex={0}
        >
          {cells.map((v, i) => (
            <button
              key={i}
              className="btn"
              onClick={(e) => {
                e.stopPropagation()
                swap(i)
              }}
              style={{
                height: 78,
                fontSize: 22,
                fontWeight: 900,
                background: v === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.25)',
                opacity: v === 0 ? 0.55 : 1,
              }}
            >
              {v === 0 ? '' : v}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 10 }} className="muted">
          点击棋盘激活键盘（↑↓←→）。Solve 会直接回到完成态并禁用。
        </div>
        <div className="divider" />
        <Row>
          <button className="btn btnPrimary" onClick={solve} disabled={solved}>
            Solve
          </button>
          <button className="btn" onClick={reset}>
            Reset（打乱）
          </button>
          <button className="btn" disabled={!moved} onClick={reset} title={!moved ? '未移动前可禁用' : '已移动可重置'}>
            Reset（需先移动才可用示例）
          </button>
        </Row>
      </div>
    </div>
  )
}

export const game2Questions: QuestionDef[] = [
  {
    group: 'game2',
    qid: 'q1',
    title: '3×3 Slide Swap',
    difficulty: '基础',
    tags: ['网格', '相邻判定', '交换更新'],
    prompt:
      '实现 3×3 拼图网格：其中 1 格为空。\n' +
      '- 点击与空格相邻的格子时，与空格交换位置\n' +
      '- 点击非相邻格子无反应\n' +
      '- 提供 Reset：重新打乱（不要求可解证明）',
    knowledge: ['扁平数组表示网格', '相邻判定（曼哈顿距离）', '不可变更新（拷贝数组）', '点击事件', 'Reset 重置'],
    summary: '经典拼图子题：3×3 网格 + 空格；点击相邻块交换；Reset 打乱。',
    Component: G2Q1,
  },
  {
    group: 'game2',
    qid: 'q2',
    title: 'TicTacToe Core',
    difficulty: '基础',
    tags: ['回合', '胜负判定', 'Overlay'],
    prompt:
      '实现标准井字棋：\n' +
      '- 玩家轮流 O/X，点击空格落子\n' +
      '- 胜利/平局后显示 Overlay（胜者/平局 + Play again）\n' +
      '- Overlay 期间禁止继续操作棋盘',
    knowledge: ['网格渲染', '回合状态（turn）', '胜负/平局判定', 'Overlay 弹层与交互锁定', '重开 reset'],
    summary: '井字棋核心：回合交替、胜负/平局判定、结束弹层锁定与重开。',
    Component: G2Q2,
  },
  {
    group: 'game2',
    qid: 'q3',
    title: 'Connect4 Mini（6×7）',
    difficulty: '提高',
    tags: ['二维数组', '落子到底', '四连检测'],
    prompt:
      '实现 6 行 7 列 Connect4：\n' +
      '- 点击列：棋子落到该列最底部空位\n' +
      '- 检测 4 连（横/竖/斜）\n' +
      '- 赢了显示胜者与总步数，并可重开',
    knowledge: ['2D 数组棋盘', '从底向上找空位（落子）', '从最后一步做连线检测', '回合切换', '胜利态处理'],
    summary: '更接近真实 Game2 的规则题：落子到底 + 从最后一步做四连检测。',
    Component: G2Q3,
  },
  {
    group: 'game2',
    qid: 'q4',
    title: 'Aim Trainer（计时点靶）',
    difficulty: '提高',
    tags: ['Onboarding', '倒计时', '每秒刷新', '命中率'],
    prompt:
      '两屏结构：\n' +
      '1) Onboarding：输入 Time Limit（默认10）与 Goal（默认5），点击 START\n' +
      '2) Playing：10×10 网格每秒出现 1 个目标（同时最多 1 个），点中 +1。\n' +
      '- 时间到：分数 ≥ Goal 胜利，否则失败\n' +
      '- 回到 Onboarding 显示上局 Accuracy = hit / (hit + miss) * 100（保留两位小数）',
    knowledge: ['表单默认值处理', '多屏状态机', 'setInterval：倒计时 + 目标刷新', '点击命中/空点统计', 'Accuracy 计算与展示'],
    summary: '典型“计时器 + 每秒刷新目标 + 统计”题：两屏状态机、Accuracy 计算。',
    Component: G2Q4,
  },
  {
    group: 'game2',
    qid: 'q5',
    title: 'Tower of Hanoi',
    difficulty: '提高',
    tags: ['栈结构', '合法移动', '步数统计'],
    prompt:
      '实现 Tower of Hanoi（3/4/5 盘）：\n' +
      '- 初始全部盘子在左柱\n' +
      '- 点击柱子选择 from，再点击柱子选择 to\n' +
      '- 只能小盘放在大盘上（非法移动无效）\n' +
      '- 全部移动到右柱胜利：显示“Success in X moves”',
    knowledge: ['数组当栈（push/pop）', '合法移动判定', 'from→to 交互状态', '步数统计', '胜利条件判定'],
    summary: '规则约束题代表：用三栈表示塔，from→to 选择移动，小盘不能压大盘。',
    Component: G2Q5,
  },
  {
    group: 'game2',
    qid: 'q6',
    title: 'Flashing Memory',
    difficulty: '提高',
    tags: ['阶段序列', '禁用/启用', '回合推进'],
    prompt:
      '四个按钮 A/B/C/D。\n' +
      '- 每轮系统展示长度 X 的序列（显示期间按钮禁用）\n' +
      '- 展示完后用户按序点击 X 次：全对进入下一轮（X+1），错则失败重开\n' +
      '- X 达到 5 判胜利并重开',
    knowledge: ['状态机（show/input）', '序列生成与播放（timeout/interval）', '按钮禁用/启用', '输入游标 cursor', '胜负与重置'],
    summary: '多阶段状态机题代表：系统播放序列，用户按序输入；X=1..5。',
    Component: G2Q6,
  },
  {
    group: 'game2',
    qid: 'q7',
    title: 'Keyboard Runner（简化蛇）',
    difficulty: '冲刺',
    tags: ['keydown', 'tick interval', '碰撞', 'Overlay'],
    prompt:
      '实现 10×10 网格移动游戏（简化蛇）：\n' +
      '- 方向键控制方向（禁止 180° 反向）\n' +
      '- 每 0.5 秒自动前进一格（tick）\n' +
      '- 吃到食物加分并生成新食物（避开身体）\n' +
      '- 撞墙/撞到自己判负；分数达到 10 判胜利；结束显示 Overlay + Play again',
    knowledge: ['keydown 监听与 cleanup', 'setInterval tick', '坐标移动与边界判定', '碰撞检测', '食物随机生成避重'],
    summary: '键盘 + tick + 碰撞判定的综合题：方向键控制、吃食物加分、撞墙/自撞失败。',
    Component: G2Q7,
  },
  {
    group: 'game2',
    qid: 'q8',
    title: 'Overlay Animation（3秒闪烁）',
    difficulty: '冲刺',
    tags: ['动画', '交互锁定', '计时控制'],
    prompt:
      '在任意游戏结束后：\n' +
      '- 先进行 3 秒闪烁动画（每 0.5 秒切换背景）\n' +
      '- 动画期间禁止点击/键盘输入\n' +
      '- 动画结束再展示 Overlay（含 Play again）',
    knowledge: ['setInterval 做闪烁动画', 'setTimeout 控制总时长', '动画期间交互锁定', '结束后清理计时器', 'Overlay 展示'],
    summary: '常见冲分点：结束后先做 3 秒闪烁动画，期间锁定交互，结束再展示 Overlay。',
    Component: G2Q8,
  },
  {
    group: 'game2',
    qid: 'q9',
    title: 'Stats Panel（schema）',
    difficulty: '冲刺',
    tags: ['localStorage schema', '聚合展示', 'avg/best'],
    prompt:
      '实现一个 Stats Panel（统计面板）：展示至少 3 个游戏的\n' +
      '- playedCount（游玩次数）\n' +
      '- avgTime（平均用时）\n' +
      '- bestScore（最佳成绩）\n' +
      '要求：先设计 localStorage schema，再在每局结束时更新，最后聚合展示。',
    knowledge: ['schema 设计（单一数据源）', 'localStorage 读写', '聚合展示（map 渲染）', '平均值计算（分母为0）', 'best 更新策略'],
    summary: '近年更常见：统一统计面板。先定 schema，再在各游戏结束处更新，最后聚合展示。',
    Component: G2Q9,
  },
  {
    group: 'game2',
    qid: 'q10',
    title: 'Puzzle 综合（键盘 + Solve）',
    difficulty: '冲刺',
    tags: ['active', '键盘移动', 'Solve/Reset 状态'],
    prompt:
      '在 3×3 拼图基础上增加：\n' +
      '- 点击棋盘后进入 active，方向键可以移动（只在 active 时响应）\n' +
      '- Solve：一键回到完成态，并禁用 Solve\n' +
      '- Reset：重新打乱；可设置“未移动前禁用”等状态规则\n' +
      '- 检测完成态后显示 solved 状态',
    knowledge: ['active 机制与键盘监听', '方向键移动的边界处理', 'Solve/Reset 按钮禁用逻辑', '完成态检测', '状态机与可维护性'],
    summary: '综合题：点击激活键盘；方向键移动；Solve 回到完成态并禁用；Reset 可设置启用条件。',
    Component: G2Q10,
  },
]
