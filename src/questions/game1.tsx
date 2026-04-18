import { useEffect, useMemo, useRef, useState } from 'react'
import type { QuestionDef } from '../types'
import { lsGet, lsSet, randomInt, shuffle } from '../lib/utils'

function MiniTitle({ children }: { children: string }) {
  return <div style={{ fontWeight: 800, marginBottom: 8 }}>{children}</div>
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="btnRow">{children}</div>
}

// -------------------------
// G1-Q1 基础｜Range Guess Lite
function G1Q1() {
  const [target, setTarget] = useState(() => randomInt(1, 20))
  const [guess, setGuess] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const tRef = useRef<number | null>(null)

  function reset() {
    if (tRef.current) window.clearTimeout(tRef.current)
    tRef.current = null
    setTarget(randomInt(1, 20))
    setGuess('')
    setMsg(null)
  }

  function submit() {
    const n = Number(guess)
    if (!guess.trim() || Number.isNaN(n) || n < 1 || n > 20) {
      setMsg('请输入 1–20 的有效数字')
      return
    }
    if (n === target) {
      setMsg('Correct! 2 秒后出下一题…')
      tRef.current = window.setTimeout(reset, 2000)
      return
    }
    setMsg(n < target ? 'Too low! Try again.' : 'Too high! Try again.')
  }

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <MiniTitle>Range Guess Lite（1–20）</MiniTitle>
      <div className="muted">随机出题 → 输入校验 → 高/低提示 → 正确后自动重置。</div>
      <div className="card" style={{ background: 'rgba(0,0,0,0.14)' }}>
        <div className="muted">我选了一个 1–20 的数，你来猜：</div>
        <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
          <input
            className="input"
            value={guess}
            placeholder="输入你的猜测…"
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          <Row>
            <button className="btn btnPrimary" onClick={submit}>
              Submit
            </button>
            <button className="btn" onClick={reset}>
              Reset
            </button>
          </Row>
          {msg && <div className={msg.includes('请输入') ? 'danger' : ''}>{msg}</div>}
        </div>
      </div>
    </div>
  )
}

// -------------------------
// G1-Q2 基础｜Math Check
function G1Q2() {
  const ops = ['+', '-', '*', '/', '%'] as const
  type Op = (typeof ops)[number]
  const [a, setA] = useState(() => randomInt(1, 50))
  const [b, setB] = useState(() => randomInt(1, 50))
  const [op, setOp] = useState<Op>(() => ops[randomInt(0, ops.length - 1)])
  const [value, setValue] = useState('')
  const [status, setStatus] = useState<'idle' | 'wrong' | 'ok'>('idle')

  const expected = useMemo(() => {
    const x = a
    const y = b
    let r = 0
    switch (op) {
      case '+':
        r = x + y
        break
      case '-':
        r = x - y
        break
      case '*':
        r = x * y
        break
      case '/':
        r = y === 0 ? 0 : x / y
        // 1 位小数四舍五入
        r = Math.round(r * 10) / 10
        break
      case '%':
        r = y === 0 ? 0 : x % y
        break
    }
    return r
  }, [a, b, op])

  function next() {
    setA(randomInt(1, 50))
    setB(randomInt(1, 50))
    setOp(ops[randomInt(0, ops.length - 1)])
    setValue('')
    setStatus('idle')
  }

  function check(v: string) {
    setValue(v)
    if (!v.trim()) {
      setStatus('idle')
      return
    }
    const n = Number(v)
    if (Number.isNaN(n)) {
      setStatus('wrong')
      return
    }
    if (n === expected) {
      setStatus('ok')
      window.setTimeout(next, 900)
    } else {
      setStatus('wrong')
    }
  }

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <MiniTitle>Math Check（随机运算 + 输入校验）</MiniTitle>
      <div className="muted">
        重点：受控输入、实时校验、除法 1 位小数四舍五入。
      </div>
      <div className="card" style={{ background: 'rgba(0,0,0,0.14)' }}>
        <div style={{ fontSize: 22, fontWeight: 800 }}>
          {a} {op} {b} ={' '}
          <input
            className="input"
            style={{ width: 160, display: 'inline-block', marginLeft: 10 }}
            value={value}
            onChange={(e) => check(e.target.value)}
            placeholder="答案"
          />
        </div>
        <div style={{ marginTop: 10 }}>
          {status === 'ok' && <span style={{ color: '#bbf7d0' }}>Correct! 出下一题…</span>}
          {status === 'wrong' && (
            <span className="danger">不对哦（提示：/ 需要四舍五入到 1 位小数）</span>
          )}
          {status === 'idle' && <span className="muted">输入后会自动校验</span>}
        </div>
        <div className="divider" />
        <Row>
          <button className="btn" onClick={next}>
            换一题
          </button>
          <span className="muted">期望答案：{expected}</span>
        </Row>
      </div>
    </div>
  )
}

// -------------------------
// G1-Q3 基础｜Word-Color Match Mini
function G1Q3() {
  const colors = ['red', 'blue', 'orange', 'yellow', 'green', 'purple', 'pink'] as const
  type C = (typeof colors)[number]
  const [active, setActive] = useState(false)
  const [round, setRound] = useState(0)
  const [text, setText] = useState<C>('red')
  const [textColor, setTextColor] = useState<C>('blue')
  const [choices, setChoices] = useState<C[]>([])
  const [msg, setMsg] = useState<string>('加载后 2 秒开始…')

  function newRound(r: number) {
    const t = colors[randomInt(0, colors.length - 1)]
    const tc = colors[randomInt(0, colors.length - 1)]
    const others = shuffle(colors.filter((x) => x !== tc)).slice(0, 3)
    const list = shuffle([tc, ...others])
    setText(t)
    setTextColor(tc)
    setChoices(list)
    setMsg(`第 ${r + 1}/3 轮：点击右侧与“文字颜色”一致的色块`)
  }

  function reset() {
    setActive(false)
    setRound(0)
    setMsg('加载后 2 秒开始…')
    window.setTimeout(() => {
      setActive(true)
      newRound(0)
    }, 2000)
  }

  useEffect(() => {
    reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function pick(c: C) {
    if (!active) return
    if (c !== textColor) return
    const nr = round + 1
    if (nr >= 3) {
      setMsg('You have won! 1.2 秒后重开…')
      setActive(false)
      window.setTimeout(reset, 1200)
      return
    }
    setRound(nr)
    newRound(nr)
  }

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <MiniTitle>Word-Color Match（延迟开始 + 唯一正确项）</MiniTitle>
      <div className="muted">典型考法：延迟启动、随机生成、点击判定、三轮胜利。</div>
      <div className="card" style={{ background: 'rgba(0,0,0,0.14)' }}>
        <div className="grid2" style={{ gap: 10 }}>
          <div
            style={{
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.10)',
              background: '#374151',
              padding: 16,
              minHeight: 140,
              display: 'grid',
              placeItems: 'center',
              fontSize: 28,
              fontWeight: 900,
              color: textColor,
            }}
          >
            {active ? text : '...'}
          </div>
          <div
            style={{
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.10)',
              background: '#1f2937',
              padding: 12,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
              minHeight: 140,
            }}
          >
            {choices.map((c) => (
              <button
                key={c}
                className="btn"
                onClick={() => pick(c)}
                style={{
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: c,
                  height: 54,
                }}
                aria-label={c}
                title={c}
              />
            ))}
          </div>
        </div>
        <div style={{ marginTop: 10 }} className="muted">
          {msg}
        </div>
        <div className="divider" />
        <Row>
          <button className="btn" onClick={reset}>
            Reset
          </button>
          <span className="muted">
            Debug：正确颜色 = <b>{textColor}</b>
          </span>
        </Row>
      </div>
    </div>
  )
}

// -------------------------
// G1-Q4 提高｜Speed Input（倒计时输入）
function G1Q4() {
  const target = 'COMP6080'
  const [status, setStatus] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle')
  const [timeLeft, setTimeLeft] = useState(15)
  const [text, setText] = useState('')
  const timerRef = useRef<number | null>(null)

  function start() {
    setStatus('playing')
    setTimeLeft(15)
    setText('')
  }

  function reset() {
    setStatus('idle')
    setTimeLeft(15)
    setText('')
  }

  useEffect(() => {
    if (status !== 'playing') {
      if (timerRef.current) window.clearInterval(timerRef.current)
      timerRef.current = null
      return
    }
    timerRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.setTimeout(() => setStatus('lost'), 0)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [status])

  function submit() {
    if (status !== 'playing') return
    if (text === target) setStatus('won')
  }

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <MiniTitle>Speed Input（15 秒内输入目标词）</MiniTitle>
      <div className="muted">典型考点：状态机 + 倒计时 interval 清理 + 结束后锁定。</div>

      <div className="card" style={{ background: 'rgba(0,0,0,0.14)' }}>
        <div className="chips">
          <span className="chip chipAmber">Time left: {timeLeft}s</span>
          <span className="chip">Target: {target}</span>
        </div>
        <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
          <input
            className="input"
            disabled={status !== 'playing'}
            value={text}
            placeholder="输入 COMP6080…"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          <Row>
            {status === 'idle' && (
              <button className="btn btnPrimary" onClick={start}>
                Start
              </button>
            )}
            {status === 'playing' && (
              <button className="btn btnPrimary" onClick={submit}>
                Submit
              </button>
            )}
            <button className="btn" onClick={reset}>
              Reset
            </button>
          </Row>
          {status === 'won' && <div style={{ color: '#bbf7d0' }}>Win! 🎯</div>}
          {status === 'lost' && <div className="danger">Time’s up…</div>}
          {status === 'playing' && (
            <div className="muted">
              小提示：这题最容易扣分的是 interval 没清理导致重开越跑越快。
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// -------------------------
// G1-Q5 提高｜5-Set Rotation（题组轮换）
function G1Q5() {
  const sets = useMemo(
    () => [
      { a: 1, b: 2, c: 2 },
      { a: 3, b: 6, c: -3 },
      { a: 8, b: 3, c: 11 },
      { a: 9, b: 8, c: 17 },
      { a: 5, b: 4, c: 9 },
    ],
    []
  )
  const [idx, setIdx] = useState(0)
  const [msg, setMsg] = useState<string | null>(null)

  const cur = sets[idx]

  function pick(op: '+' | '-' | 'x' | '÷') {
    const { a, b, c } = cur
    let ok = false
    if (op === '+') ok = a + b === c
    if (op === '-') ok = a - b === c
    if (op === 'x') ok = a * b === c
    if (op === '÷') ok = b !== 0 && a / b === c

    if (!ok) {
      setMsg('Incorrect（错误不会换题，可继续尝试）')
      return
    }
    setMsg('Correct! 下一题…')
    window.setTimeout(() => {
      setIdx((i) => (i + 1) % sets.length)
      setMsg(null)
    }, 700)
  }

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <MiniTitle>Operation Blanks（按钮补全算式）</MiniTitle>
      <div className="muted">典型考法：按钮事件 + 判定 + 错误不换题 + 题组轮换。</div>
      <div className="card" style={{ background: 'rgba(0,0,0,0.14)' }}>
        <div style={{ fontSize: 26, fontWeight: 900 }}>
          {cur.a} ? {cur.b} = {cur.c}
        </div>
        <div className="divider" />
        <Row>
          <button className="btn btnPrimary" onClick={() => pick('+')}>
            +
          </button>
          <button className="btn btnPrimary" onClick={() => pick('-')}>
            -
          </button>
          <button className="btn btnPrimary" onClick={() => pick('x')}>
            ×
          </button>
          <button className="btn btnPrimary" onClick={() => pick('÷')}>
            ÷
          </button>
          <button className="btn" onClick={() => setIdx((i) => (i + 1) % sets.length)}>
            跳过
          </button>
        </Row>
        {msg && (
          <div style={{ marginTop: 10 }} className={msg.startsWith('Incorrect') ? 'danger' : ''}>
            {msg}
          </div>
        )}
        <div style={{ marginTop: 10 }} className="muted">
          题组进度：{idx + 1}/{sets.length}
        </div>
      </div>
    </div>
  )
}

// -------------------------
// G1-Q6 提高｜Best Score Storage（难度 + best）
type Diff = 'Easy' | 'Medium' | 'Hard'
function rangeFor(d: Diff) {
  if (d === 'Easy') return { min: 1, max: 10, sec: 20 }
  if (d === 'Medium') return { min: 1, max: 50, sec: 30 }
  return { min: 1, max: 100, sec: 60 }
}

function G1Q6() {
  const KEY = 'g1q6.bestByDiff'
  const [diff, setDiff] = useState<Diff>('Easy')
  const [status, setStatus] = useState<'choose' | 'playing' | 'end'>('choose')
  const [target, setTarget] = useState(0)
  const [guess, setGuess] = useState('')
  const [timeLeft, setTimeLeft] = useState(0)
  const [msg, setMsg] = useState<string | null>(null)
  const best = lsGet<Record<Diff, number | null>>(KEY, { Easy: null, Medium: null, Hard: null })
  const timerRef = useRef<number | null>(null)

  function start(d: Diff) {
    const { min, max, sec } = rangeFor(d)
    setDiff(d)
    setStatus('playing')
    setTarget(randomInt(min, max))
    setGuess('')
    setMsg(null)
    setTimeLeft(sec)
  }

  useEffect(() => {
    if (status !== 'playing') {
      if (timerRef.current) window.clearInterval(timerRef.current)
      timerRef.current = null
      return
    }
    timerRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.setTimeout(() => {
            setStatus('end')
            setMsg(`Time’s up! 正确答案是 ${target}`)
          }, 0)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [status, target])

  function submit() {
    if (status !== 'playing') return
    const { min, max } = rangeFor(diff)
    const n = Number(guess)
    if (!guess.trim() || Number.isNaN(n) || n < min || n > max) {
      setMsg(`请输入 ${min}–${max} 的有效数字`)
      return
    }
    if (n === target) {
      const remaining = timeLeft
      const currentBest = best[diff]
      const newBest = currentBest == null ? remaining : Math.max(currentBest, remaining)
      const next = { ...best, [diff]: newBest }
      lsSet(KEY, next)
      setStatus('end')
      setMsg(`Congratulations! 剩余 ${remaining}s（Best：${newBest}s）`)
    } else {
      setMsg(n < target ? 'Too low! Try again.' : 'Too high! Try again.')
    }
  }

  const { min, max, sec } = rangeFor(diff)

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <MiniTitle>GuessTheNumber（难度 + 倒计时 + Best Score）</MiniTitle>
      <div className="muted">典型考点：难度选择、输入校验、倒计时、best score 持久化。</div>

      <div className="card" style={{ background: 'rgba(0,0,0,0.14)' }}>
        {status === 'choose' && (
          <>
            <div className="muted">选择难度开始：</div>
            <div className="divider" />
            <Row>
              {(['Easy', 'Medium', 'Hard'] as Diff[]).map((d) => (
                <button key={d} className="btn btnPrimary" onClick={() => start(d)}>
                  {d}
                </button>
              ))}
            </Row>
            <div style={{ marginTop: 10 }} className="muted">
              Best（剩余时间越大越好）：Easy {best.Easy ?? '-'}s ｜ Medium {best.Medium ?? '-'}s ｜ Hard{' '}
              {best.Hard ?? '-'}s
            </div>
          </>
        )}

        {status !== 'choose' && (
          <>
            <div className="chips">
              <span className="chip chipAmber">Diff: {diff}</span>
              <span className="chip chipAmber">Time left: {timeLeft}s</span>
              <span className="chip">
                Range: {min}–{max}（总 {sec}s）
              </span>
            </div>
            <div className="divider" />
            <div className="muted">
              我选了一个 {min}–{max} 的数：
            </div>
            <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
              <input
                className="input"
                value={guess}
                disabled={status !== 'playing'}
                onChange={(e) => setGuess(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                placeholder="输入你的猜测…"
              />
              <Row>
                <button className="btn btnPrimary" disabled={status !== 'playing'} onClick={submit}>
                  Submit Guess
                </button>
                <button className="btn" onClick={() => setStatus('choose')}>
                  返回难度选择
                </button>
              </Row>
              {msg && <div className={msg.includes('请输入') ? 'danger' : ''}>{msg}</div>}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// -------------------------
// G1-Q7 冲刺｜Input Mask（3 挖空）
function G1Q7() {
  const phrases = useMemo(
    () => ['HELLO WORLD', 'REACT IS FUN', 'FINAL IS HARD', 'TYPE SCRIPT!', 'LOCAL STORAGE'],
    []
  )
  const [phrase, setPhrase] = useState(phrases[0])
  const [holes, setHoles] = useState<number[]>([])
  const [inputs, setInputs] = useState<Record<number, string>>({})
  const [msg, setMsg] = useState<string | null>(null)

  function newPuzzle() {
    const p = phrases[randomInt(0, phrases.length - 1)].padEnd(12, ' ')
    const candidates = [...p].map((ch, i) => (ch === ' ' ? -1 : i)).filter((i) => i >= 0)
    const pick = shuffle(candidates).slice(0, 3)
    setPhrase(p.slice(0, 12))
    setHoles(pick)
    setInputs({})
    setMsg(null)
  }

  useEffect(() => {
    newPuzzle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (holes.length !== 3) return
    const allFilled = holes.every((i) => (inputs[i] ?? '').length === 1)
    if (!allFilled) return
    const ok = holes.every((i) => (inputs[i] ?? '').toUpperCase() === phrase[i].toUpperCase())
    if (ok) {
      setMsg('Correct! 出下一题…')
      window.setTimeout(newPuzzle, 900)
    } else {
      setMsg('不对：已清空挖空位，请重试同一句')
      const next: Record<number, string> = { ...inputs }
      holes.forEach((i) => (next[i] = ''))
      setInputs(next)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs])

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <MiniTitle>Input Mask（12 格 + 随机挖空 3 个字符）</MiniTitle>
      <div className="muted">典型考点：列表渲染、受控输入、多输入校验、重试逻辑。</div>
      <div className="card" style={{ background: 'rgba(0,0,0,0.14)' }}>
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 8 }}>
            {[...phrase].slice(0, 12).map((ch, i) => {
              const isHole = holes.includes(i)
              return (
                <div
                  key={i}
                  style={{
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(0,0,0,0.2)',
                    height: 44,
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 900,
                    letterSpacing: 0.6,
                  }}
                >
                  {!isHole && <span>{ch === ' ' ? '·' : ch}</span>}
                  {isHole && (
                    <input
                      className="input"
                      value={inputs[i] ?? ''}
                      onChange={(e) => {
                        const v = e.target.value.slice(-1).toUpperCase()
                        setInputs((s) => ({ ...s, [i]: v }))
                      }}
                      style={{
                        width: 36,
                        height: 36,
                        textAlign: 'center',
                        padding: 0,
                        fontWeight: 900,
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>
          <Row>
            <button className="btn" onClick={newPuzzle}>
              换一句
            </button>
            <span className="muted">提示：空格用 “·” 显示（挖空不会挖到空格）</span>
          </Row>
          {msg && <div className={msg.startsWith('不对') ? 'danger' : ''}>{msg}</div>}
        </div>
      </div>
    </div>
  )
}

// -------------------------
// G1-Q8 冲刺｜Network Init + Fallback
function G1Q8() {
  const KEY = 'g1q8.score'
  const URL = 'https://cgi.cse.unsw.edu.au/~cs6080/raw/data/score.json'
  const [x, setX] = useState<number>(() => lsGet<number | null>(KEY, null) ?? 5)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'ok'>('idle')

  async function init(fromReset: boolean) {
    setStatus('loading')
    try {
      const res = await fetch(URL)
      const data = (await res.json()) as { score: number }
      const val = Number(data.score) || 5
      setX(val)
      lsSet(KEY, val)
      setStatus('ok')
    } catch {
      // 兜底：5
      const val = 5
      setX(val)
      lsSet(KEY, val)
      setStatus(fromReset ? 'error' : 'error')
    }
  }

  useEffect(() => {
    const cached = lsGet<number | null>(KEY, null)
    if (cached == null) init(false)
    else setX(cached)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <MiniTitle>Network Init（fetch 初始值 + localStorage 优先级 + 失败兜底）</MiniTitle>
      <div className="muted">典型考点：初始化优先级、reset 行为、网络失败不崩。</div>
      <div className="card" style={{ background: 'rgba(0,0,0,0.14)' }}>
        <div style={{ fontSize: 24, fontWeight: 900 }}>X = {x}</div>
        <div className="muted" style={{ marginTop: 6 }}>
          URL：{URL}
        </div>
        <div className="divider" />
        <Row>
          <button className="btn btnPrimary" onClick={() => init(true)} disabled={status === 'loading'}>
            Reset（重新 fetch）
          </button>
          <button
            className="btn"
            onClick={() => {
              setX((v) => v + 1)
              lsSet(KEY, x + 1)
            }}
          >
            +1（模拟胜利/扣分逻辑）
          </button>
        </Row>
        <div style={{ marginTop: 10 }} className="muted">
          {status === 'loading' && '正在 fetch…'}
          {status === 'ok' && 'fetch 成功并写入 localStorage'}
          {status === 'error' && 'fetch 失败：已使用默认值 5（仍写入 localStorage）'}
          {status === 'idle' && '就绪'}
        </div>
      </div>
    </div>
  )
}

// -------------------------
// G1-Q9 冲刺｜Multi-step Rounds
function G1Q9() {
  const [stage, setStage] = useState<1 | 2 | 3 | 4>(1) // 4 = done
  const [pwd, setPwd] = useState('')
  const [color, setColor] = useState<'red' | 'green' | 'blue'>(() => 'red')
  const [pick, setPick] = useState<string | null>(null)
  const [a, setA] = useState(() => randomInt(1, 9))
  const [b, setB] = useState(() => randomInt(1, 9))
  const [ans, setAns] = useState('')
  const [timeLeft, setTimeLeft] = useState(10)
  const timerRef = useRef<number | null>(null)

  function reset() {
    setStage(1)
    setPwd('')
    setPick(null)
    setColor(['red', 'green', 'blue'][randomInt(0, 2)] as any)
    setA(randomInt(1, 9))
    setB(randomInt(1, 9))
    setAns('')
    setTimeLeft(10)
  }

  useEffect(() => {
    if (stage !== 3) {
      if (timerRef.current) window.clearInterval(timerRef.current)
      timerRef.current = null
      return
    }
    timerRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.setTimeout(reset, 0)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
      timerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage])

  const right = a + b

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <MiniTitle>Multi-step Rounds（3 关小关卡状态机）</MiniTitle>
      <div className="muted">典型考点：阶段推进 + 每关独立 state + 关卡切换清理。</div>
      <div className="card" style={{ background: 'rgba(0,0,0,0.14)' }}>
        <div className="chips">
          <span className="chip chipPurple">Stage {stage}/3</span>
          {stage === 3 && <span className="chip chipAmber">Time left: {timeLeft}s</span>}
        </div>
        <div className="divider" />

        {stage === 1 && (
          <div style={{ display: 'grid', gap: 10 }}>
            <div className="muted">Stage1：输入密码 6080</div>
            <input className="input" value={pwd} onChange={(e) => setPwd(e.target.value)} />
            <Row>
              <button
                className="btn btnPrimary"
                onClick={() => {
                  if (pwd === '6080') setStage(2)
                }}
              >
                Submit
              </button>
              <button className="btn" onClick={reset}>
                Reset
              </button>
            </Row>
          </div>
        )}

        {stage === 2 && (
          <div style={{ display: 'grid', gap: 10 }}>
            <div className="muted">Stage2：点击正确颜色（随机 1/3）</div>
            <Row>
              {(['red', 'green', 'blue'] as const).map((c) => (
                <button
                  key={c}
                  className="btn"
                  style={{ background: c, borderColor: 'rgba(255,255,255,0.18)' }}
                  onClick={() => {
                    setPick(c)
                    if (c === color) setStage(3)
                  }}
                >
                  {c}
                </button>
              ))}
            </Row>
            <div className="muted">
              {pick ? `你选了：${pick}` : '请选择'}
              <span style={{ marginLeft: 10, opacity: 0.7 }}>(debug：正确答案 = {color})</span>
            </div>
          </div>
        )}

        {stage === 3 && (
          <div style={{ display: 'grid', gap: 10 }}>
            <div className="muted">Stage3：10 秒内算对：{a} + {b} = ?</div>
            <input className="input" value={ans} onChange={(e) => setAns(e.target.value)} />
            <Row>
              <button
                className="btn btnPrimary"
                onClick={() => {
                  if (Number(ans) === right) setStage(4)
                }}
              >
                Submit
              </button>
              <button className="btn" onClick={reset}>
                Reset
              </button>
            </Row>
          </div>
        )}

        {stage === 4 && (
          <div style={{ display: 'grid', gap: 10 }}>
            <div style={{ color: '#bbf7d0', fontWeight: 900 }}>Congratulations! 通关</div>
            <Row>
              <button className="btn btnPrimary" onClick={reset}>
                Play again
              </button>
            </Row>
          </div>
        )}
      </div>
    </div>
  )
}

// -------------------------
// G1-Q10 冲刺｜Mini Stats（跨局统计）
function G1Q10() {
  const KEY = 'g1q10.stats'
  type Stats = { played: number; won: number; bestStreak: number; streak: number }
  const [s, setS] = useState<Stats>(() => lsGet(KEY, { played: 0, won: 0, bestStreak: 0, streak: 0 }))
  const [target, setTarget] = useState(() => randomInt(1, 5))
  const [guess, setGuess] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  function persist(next: Stats) {
    setS(next)
    lsSet(KEY, next)
  }

  function newRound(nextStats?: Stats) {
    setTarget(randomInt(1, 5))
    setGuess('')
    setMsg(null)
    if (nextStats) persist(nextStats)
  }

  function submit() {
    const n = Number(guess)
    const played = s.played + 1
    if (!guess.trim() || Number.isNaN(n) || n < 1 || n > 5) {
      setMsg('请输入 1–5 的有效数字')
      persist({ ...s, played })
      return
    }
    if (n === target) {
      const won = s.won + 1
      const streak = s.streak + 1
      const bestStreak = Math.max(s.bestStreak, streak)
      setMsg('Correct! 连胜 +1（自动下一局）')
      window.setTimeout(() => newRound({ played, won, streak, bestStreak }), 650)
      return
    }
    // miss：断连
    setMsg('Wrong… 连胜中断（自动下一局）')
    window.setTimeout(() => newRound({ played, won: s.won, streak: 0, bestStreak: s.bestStreak }), 650)
  }

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <MiniTitle>Mini Stats（played / won / bestStreak 持久化）</MiniTitle>
      <div className="muted">典型考点：localStorage schema、更新时机、best 逻辑。</div>
      <div className="card" style={{ background: 'rgba(0,0,0,0.14)' }}>
        <div className="chips">
          <span className="chip">Played: {s.played}</span>
          <span className="chip chipGreen">Won: {s.won}</span>
          <span className="chip chipAmber">Streak: {s.streak}</span>
          <span className="chip chipPurple">Best streak: {s.bestStreak}</span>
        </div>
        <div className="divider" />
        <div className="muted">猜 1–5：我选了一个数。</div>
        <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
          <input
            className="input"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          <Row>
            <button className="btn btnPrimary" onClick={submit}>
              Submit
            </button>
            <button className="btn btnDanger" onClick={() => persist({ played: 0, won: 0, bestStreak: 0, streak: 0 })}>
              清空统计
            </button>
            <button className="btn" onClick={() => setMsg(`debug：正确答案 = ${target}`)}>
              Debug
            </button>
          </Row>
          {msg && <div className={msg.includes('请输入') ? 'danger' : ''}>{msg}</div>}
        </div>
      </div>
    </div>
  )
}

export const game1Questions: QuestionDef[] = [
  {
    group: 'game1',
    qid: 'q1',
    title: 'Range Guess Lite',
    difficulty: '基础',
    tags: ['受控输入', '校验', '重置闭环'],
    prompt:
      '实现一个“轻量猜数”页面：\n' +
      '- 随机生成 1–20 的整数\n' +
      '- 用户输入猜测值并提交（支持 Enter）\n' +
      '- 非法输入（空/非数字/超范围）显示红色错误提示\n' +
      '- 合法但猜错：显示 Too low / Too high\n' +
      '- 猜对：显示 Correct，并在 2 秒后自动重置出新题（清空输入与提示）',
    knowledge: ['受控输入', '输入合法性校验', 'Number/NaN 处理', '条件渲染提示', 'setTimeout 自动重置'],
    summary: '随机出题 → 输入校验 → 高/低提示 → 猜对后自动重置（非常典型的 Game1 节奏）。',
    Component: G1Q1,
  },
  {
    group: 'game1',
    qid: 'q2',
    title: 'Math Check（含 / 四舍五入）',
    difficulty: '基础',
    tags: ['随机', '表达式计算', '浮点处理'],
    prompt:
      '页面显示：A op B = [input]（A/B 为 1–50，op 从 + - * / % 随机）。\n' +
      '- 输入框每次变化都触发校验\n' +
      '- / 的结果若非整数，按 1 位小数四舍五入后再比较\n' +
      '- 正确：显示/弹窗提示并自动出下一题；错误：提示或不提示均可',
    knowledge: ['随机生成', '表达式计算', '受控输入实时校验', '四舍五入到 1 位小数', '正确后重置'],
    summary: '随机数 + 随机运算符；实时校验；/ 结果按 1 位小数四舍五入后比较。',
    Component: G1Q2,
  },
  {
    group: 'game1',
    qid: 'q3',
    title: 'Word-Color Match',
    difficulty: '基础',
    tags: ['延迟开始', '唯一正确项', '三轮胜利'],
    prompt:
      '页面左右两区：\n' +
      '- 左侧：显示一个颜色词（文字颜色随机），页面加载后 2 秒才开始显示\n' +
      '- 右侧：4 个色块，其中“恰好一个”色块颜色与左侧文字颜色一致\n' +
      '- 用户点对：进入下一轮；连续 3 轮点对判胜利（提示后重置）',
    knowledge: ['setTimeout 延迟开始', '随机生成（且保证唯一正确）', '点击判定', '回合计数', '胜利后重置闭环'],
    summary: '加载 2 秒后开始；右侧 4 色块中仅 1 个与“文字颜色”匹配；连续 3 轮胜利重置。',
    Component: G1Q3,
  },
  {
    group: 'game1',
    qid: 'q4',
    title: 'Speed Input（倒计时）',
    difficulty: '提高',
    tags: ['状态机', '倒计时', 'interval 清理'],
    prompt:
      '点击 Start 后开始 15 秒倒计时。\n' +
      '- 倒计时期间输入框可用，要求在时间内完整输入目标词 COMP6080 并提交\n' +
      '- 猜中：胜利；超时：失败\n' +
      '- 结束后展示结果，并提供 Play again / Reset',
    knowledge: ['状态机（idle/playing/won/lost）', 'setInterval 倒计时', 'cleanup 清理 interval', '受控输入 + 提交', '结束态交互锁定'],
    summary: 'Start 后 15 秒倒计时；时间内输入目标词判胜；重点是 interval 的正确清理与状态锁定。',
    Component: G1Q4,
  },
  {
    group: 'game1',
    qid: 'q5',
    title: 'Operation Blanks（题组轮换）',
    difficulty: '提高',
    tags: ['按钮事件', '判定', '错误不换题'],
    prompt:
      '给定 5 组题：A ? B = C。用户点击 + / - / × / ÷ 选择正确运算符。\n' +
      '- 选择正确：进入下一组\n' +
      '- 选择错误：提示 Incorrect，但不换题（允许继续尝试）\n' +
      '- 做完 5 组后允许循环回到第一组',
    knowledge: ['按钮事件处理', '题组 index 轮换', '判定逻辑', '错误不换题的状态控制', '函数式 setState 防抖动'],
    summary: '给定 5 组题；点击 + - × ÷ 补全算式；错了不换题；对了进入下一组并循环。',
    Component: G1Q5,
  },
  {
    group: 'game1',
    qid: 'q6',
    title: 'GuessTheNumber（Best Score）',
    difficulty: '提高',
    tags: ['难度选择', '倒计时', 'localStorage best'],
    prompt:
      '实现“猜数字”小游戏（含难度选择）：Easy/Medium/Hard。\n' +
      '- 选择难度后开始倒计时，用户可反复提交猜测\n' +
      '- 输入需做范围校验，不合法显示错误提示\n' +
      '- 猜错提示 Too low/Too high\n' +
      '- 猜中：记录该难度的 best score（例如：剩余时间越多越好）到 localStorage，并显示',
    knowledge: ['路由/页面状态切换（简化为单组件也可）', '倒计时', '输入校验与提示', 'localStorage 读写', 'best score 比较与更新'],
    summary: '三难度 + 倒计时；猜中后记录 best（剩余时间越高越好）到 localStorage。',
    Component: G1Q6,
  },
  {
    group: 'game1',
    qid: 'q7',
    title: 'Input Mask（随机挖空 3 个）',
    difficulty: '冲刺',
    tags: ['多输入校验', '随机挖空', '重试策略'],
    prompt:
      '从词库随机选一条短句（含空格），渲染为 12 个格子。\n' +
      '- 随机挖空 3 个“非空格字符”，变成 3 个单字符输入框\n' +
      '- 当 3 个输入都填写后：\n' +
      '  - 全对：提示 Correct，进入下一句\n' +
      '  - 有错：提示错误并清空 3 个输入（同一句重试）',
    knowledge: ['列表渲染', '随机抽样（避开空格）', '多输入受控与聚合校验', '重试与清空策略', '字符串索引处理'],
    summary: '12 格字符串渲染，随机挖空 3 个非空格字符；全填后判定：错则清空挖空位重试。',
    Component: G1Q7,
  },
  {
    group: 'game1',
    qid: 'q8',
    title: 'Network Init + Fallback',
    difficulty: '冲刺',
    tags: ['fetch JSON', '失败兜底', '初始化优先级'],
    prompt:
      '实现一个计数器 X 的初始化流程：\n' +
      '- 首次进入：优先读 localStorage；若没有则 fetch 给定 URL 的 {score}\n' +
      '- fetch 失败：使用默认值 5（但仍要写入 localStorage，保证后续可用）\n' +
      '- Reset：重新 fetch（失败仍回默认）',
    knowledge: ['初始化优先级设计', 'fetch JSON', '异常/失败兜底', 'localStorage 持久化', '按钮触发重新初始化'],
    summary: '首次进入优先读 localStorage；若无则 fetch 初始值；失败兜底 5；Reset 重新 fetch。',
    Component: G1Q8,
  },
  {
    group: 'game1',
    qid: 'q9',
    title: 'Multi-step Rounds（3关）',
    difficulty: '冲刺',
    tags: ['阶段推进', '多状态', '清理'],
    prompt:
      '实现 3 关小关卡：\n' +
      '1) 输入密码 6080\n' +
      '2) 点击正确颜色（随机 3 选 1）\n' +
      '3) 10 秒内完成一次正确算式\n' +
      '- 每关通过进入下一关；失败停留当前关重试；通关后显示 Congratulations 并可重开',
    knowledge: ['多阶段状态机（stage）', '每关独立 state 管理', '计时器只在某关启用并清理', '条件渲染', '通关与重开流程'],
    summary: '密码 → 颜色 → 10 秒算术三关；体现“关卡状态机”与每关独立 state/清理。',
    Component: G1Q9,
  },
  {
    group: 'game1',
    qid: 'q10',
    title: 'Mini Stats（跨局统计）',
    difficulty: '冲刺',
    tags: ['schema 设计', '持久化', 'best 逻辑'],
    prompt:
      '为任意 Game1 小游戏加入统计区：\n' +
      '- playedCount：游玩次数\n' +
      '- winCount：胜利次数\n' +
      '- best：最佳成绩（例如最高连胜/最短用时）\n' +
      '要求：数据跨页面刷新仍保留（localStorage 持久化），并提供清空统计按钮。',
    knowledge: ['localStorage schema 设计', '统计更新时机', 'best 比较逻辑', '持久化读写', 'UI 展示（chips/表格）'],
    summary: '在小游戏内维护 played/won/streak/bestStreak，并持久化；用于训练 Stats 写法。',
    Component: G1Q10,
  },
]
