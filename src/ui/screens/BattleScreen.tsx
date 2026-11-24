import { useEffect, useRef, useState } from 'react'
import {
  activeOf,
  isStruggling,
  STRUGGLE,
  switchTargets,
  typeEffectiveness,
  type BattleState,
  type Choice,
  type Combatant,
  type SideIndex,
} from '../../engine'
import { ROSTER } from '../../data/roster'
import { HOSTILE, PLAYER } from '../battleLog'
import { playerMustReplace, type Step } from '../battleController'
import type { BattleDriver, BattleView, DriverStatus } from '../battleDriver'
import { ClassBadge, ContainmentCard, EquipmentTag, TypeBadge, TypeChartButton } from '../components'
import { framesFor, type Frame } from '../playback'
import { TYPE_ABBR, describeMove, effectivenessTag } from '../text'

const LONG_PRESS_MS = 450
/** Delay between battle messages during playback. */
const FRAME_MS = 600

interface Shown {
  view: BattleState
  log: string[]
}

/** "1:45" until `deadline`, ticking each second. */
function Countdown({ deadline }: { deadline: number }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [])
  const left = Math.max(0, Math.ceil((deadline - now) / 1000))
  return (
    <>
      {Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')}
    </>
  )
}

function hpClass(hp: number, max: number): string {
  const r = hp / max
  return r > 0.5 ? 'hp-high' : r > 0.2 ? 'hp-mid' : 'hp-low'
}

function HpBar({ c, exact }: { c: Combatant; exact: boolean }) {
  const pct = Math.max(0, (c.hp / c.stats.hp) * 100)
  return (
    <div className="hp">
      <div className="hp-track" aria-hidden>
        <span className={hpClass(c.hp, c.stats.hp)} style={{ width: `${pct}%` }} />
      </div>
      <span className="hp-text">{exact ? `${c.hp}/${c.stats.hp}` : `${Math.ceil(pct)}%`}</span>
    </div>
  )
}

function SideInfo({ state, side }: { state: BattleState; side: SideIndex }) {
  const c = activeOf(state, side)
  const sp = ROSTER.species[c.speciesId]
  const remaining = state.sides[side].team.filter((m) => m.hp > 0).length
  return (
    <div className={`side-info ${side === HOSTILE ? 'hostile' : 'own'}`}>
      <div className="row" style={{ gap: 6 }}>
        <strong>{sp.name}</strong>
        <ClassBadge objectClass={sp.objectClass} />
        {c.status && <span className="badge status-badge">{c.status.name.toUpperCase()}</span>}
      </div>
      <div className="row" style={{ gap: 4 }}>
        {sp.types.map((t) => (
          <TypeBadge key={t} type={t} />
        ))}
        <EquipmentTag id={c.equipment} />
        <span className="muted small">
          {'●'.repeat(remaining)}
          {'○'.repeat(state.sides[side].team.length - remaining)}
        </span>
      </div>
      <HpBar c={c} exact={side === PLAYER} />
    </div>
  )
}

/** The player's team, for switching or replacing; only legal targets are enabled. */
function BenchList({
  state,
  onPick,
  only,
}: {
  state: BattleState
  onPick: (teamIndex: number) => void
  /** Tutorial: the one team member that may be picked. */
  only?: number
}) {
  const options = switchTargets(state, PLAYER).filter((i) => only === undefined || i === only)
  return (
    <div className="bench">
      {state.sides[PLAYER].team.map((c, i) => {
        const sp = ROSTER.species[c.speciesId]
        return (
          <button
            key={i}
            className={`bench-item${only === i ? ' guided' : ''}`}
            disabled={!options.includes(i)}
            onClick={() => onPick(i)}
          >
            <span className="stack" style={{ gap: 4 }}>
              <span>
                <strong>{sp.name}</strong>
                {i === state.sides[PLAYER].active && <span className="muted small"> · ACTIVE</span>}
                {c.status && <span className="badge status-badge">{c.status.name.toUpperCase()}</span>}
              </span>
              <span className="row" style={{ gap: 4 }}>
                {sp.types.map((t) => (
                  <TypeBadge key={t} type={t} />
                ))}
              </span>
            </span>
            <span className={c.hp > 0 ? 'small' : 'small muted'}>
              {c.hp > 0 ? `${c.hp}/${c.stats.hp}` : 'NEUTRALIZED'}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function BattleScreen({
  driver,
  onFinished,
  onExit,
}: {
  driver: BattleDriver
  onFinished: (final: BattleState) => void
  /** Leave a battle that was called off (No Contest). */
  onExit?: () => void
}) {
  // `real` is the true battle; `display` is what's on screen, which lags
  // behind while a turn's events play back one frame at a time.
  const [real_, setReal] = useState<BattleView>(driver.initial)
  const [status, setStatus] = useState<DriverStatus>({ kind: 'ready' })
  const [display, setDisplay] = useState<Shown>({ view: driver.initial.state, log: driver.initial.log })
  const [playing, setPlaying] = useState(false)
  const [tick, setTick] = useState(0)
  const [hit, setHit] = useState<{ side: SideIndex; n: number } | null>(null)
  const queue = useRef<Frame[]>([])
  const final = useRef<Shown>(display)

  const [switching, setSwitching] = useState(false)
  const [confirmForfeit, setConfirmForfeit] = useState(false)
  const [info, setInfo] = useState<string | null>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const pressTimer = useRef<number | null>(null)
  const longPressed = useRef(false)

  const state = display.view
  const me = activeOf(state, PLAYER)
  const foe = activeOf(state, HOSTILE)
  const mySpecies = ROSTER.species[me.speciesId]
  const foeTypes = ROSTER.species[foe.speciesId].types
  // Controls act on the real state, and only once playback has caught up.
  const real = real_.state
  const waiting = status.kind === 'waiting'
  const ended = real.phase === 'ended'
  const mustReplace = playerMustReplace(real)
  const realActive = activeOf(real, PLAYER)
  const contained = realActive.status?.name === 'Contained'
  const struggling = isStruggling(realActive)
  const benchOptions = switchTargets(real, PLAYER)
  // Tutorial: the current hint, and the one action it allows.
  const guide = !playing && !ended ? (driver.guide?.() ?? null) : null
  const allow = guide?.allow ?? { kind: 'any' as const }
  const moveAllowed = (i: number) => allow.kind === 'any' || (allow.kind === 'move' && allow.moveIndex === i)
  const switchAllowed = allow.kind === 'any' || allow.kind === 'switch'
  const switchOnly = allow.kind === 'switch' ? allow.teamIndex : undefined

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight })
  }, [display.log.length])

  // Play queued frames: one every FRAME_MS (instantly for frames with no message).
  useEffect(() => {
    if (!playing) return
    const frame = queue.current.shift()
    if (!frame) {
      setDisplay(final.current)
      setPlaying(false)
      return
    }
    setDisplay((d) => ({ view: frame.view, log: [...d.log, ...frame.lines] }))
    if (frame.hit !== null) {
      const side = frame.hit
      setHit((h) => ({ side, n: (h?.n ?? 0) + 1 }))
    }
    const t = window.setTimeout(() => setTick((n) => n + 1), frame.lines.length > 0 ? FRAME_MS : 0)
    return () => window.clearTimeout(t)
  }, [playing, tick])

  const play = (steps: Step[], view: BattleView) => {
    setReal(view)
    final.current = { view: view.state, log: view.log }
    queue.current = [...queue.current, ...framesFor(steps, ROSTER)]
    setPlaying(true)
    setTick((n) => n + 1)
  }
  const playRef = useRef(play)
  playRef.current = play
  useEffect(
    () => driver.listen({ advance: (steps, view) => playRef.current(steps, view), status: setStatus }),
    [driver],
  )
  const skip = () => {
    if (!playing) return
    queue.current = []
    setDisplay(final.current)
    setPlaying(false)
  }

  const act = (choice: Choice) => {
    setSwitching(false)
    setInfo(null)
    driver.choose(choice)
  }
  const replace = (i: number) => driver.replace(i)

  // Dev-only: ?demo=1 uses the first move automatically, to check playback in
  // headless screenshots. Stripped from production builds.
  // (React dev mode mounts twice; the cleanup cancels the first timer.)
  useEffect(() => {
    if (!import.meta.env.DEV) return
    if (!new URLSearchParams(window.location.search).get('demo')) return
    const t = window.setTimeout(() => driver.choose({ kind: 'move', moveIndex: 0 }), 300)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, [])
  const doForfeit = () => {
    setConfirmForfeit(false)
    driver.forfeit()
  }

  const startPress = (text: string) => {
    longPressed.current = false
    pressTimer.current = window.setTimeout(() => {
      longPressed.current = true
      setInfo(text)
    }, LONG_PRESS_MS)
  }
  const endPress = () => {
    if (pressTimer.current !== null) window.clearTimeout(pressTimer.current)
    pressTimer.current = null
  }

  return (
    <main className="screen battle">
      <div className="screen-head">
        <span className="muted small">TURN {state.turn}</span>
        <span className="row" style={{ flexWrap: 'nowrap', gap: 6 }}>
          {!playing && <TypeChartButton />}
          {!ended &&
            !playing &&
            !waiting &&
            status.kind !== 'noContest' &&
            (confirmForfeit ? (
              <span className="row" style={{ flexWrap: 'nowrap' }}>
                <span className="small">Forfeit?</span>
                <button className="btn btn-small btn-primary" onClick={doForfeit}>
                  Yes
                </button>
                <button className="btn btn-small" onClick={() => setConfirmForfeit(false)}>
                  No
                </button>
              </span>
            ) : (
              <button className="btn btn-small" onClick={() => setConfirmForfeit(true)}>
                Forfeit
              </button>
            ))}
        </span>
      </div>

      <section className={`field${playing ? ' skippable' : ''}`} onClick={skip}>
        <div className="field-row hostile">
          <SideInfo state={state} side={HOSTILE} />
          <div
            key={`h${hit?.side === HOSTILE ? hit.n : 0}`}
            className={`field-art${hit?.side === HOSTILE ? ' hit' : ''}${foe.hp <= 0 ? ' down' : ''}`}
          >
            <ContainmentCard speciesId={foe.speciesId} />
          </div>
        </div>
        <div className="field-row own">
          <div
            key={`p${hit?.side === PLAYER ? hit.n : 0}`}
            className={`field-art${hit?.side === PLAYER ? ' hit' : ''}${me.hp <= 0 ? ' down' : ''}`}
          >
            <ContainmentCard speciesId={me.speciesId} />
          </div>
          <SideInfo state={state} side={PLAYER} />
        </div>
      </section>

      <div className={`log${playing ? ' skippable' : ''}`} ref={logRef} aria-live="polite" onClick={skip}>
        {display.log.slice(-40).map((line, i) => (
          <p key={display.log.length - 40 + i}>&gt; {line}</p>
        ))}
      </div>

      <section className="controls">
        {status.kind === 'opponentAway' && !ended && (
          <p className="notice small" role="status">
            {driver.opponent} lost connection. You win in <Countdown deadline={status.deadline} /> unless they
            return.
          </p>
        )}
        {guide && status.kind !== 'noContest' && (
          <p className="guide-hint" role="status">
            {guide.text}
          </p>
        )}
        {status.kind === 'noContest' ? (
          <div className="stack">
            <p className="result-banner">NO CONTEST</p>
            <p className="small muted">{status.reason}</p>
            <button className="btn btn-primary" onClick={onExit}>
              Leave
            </button>
          </div>
        ) : playing ? (
          <button className="btn" onClick={skip}>
            ▸▸ Tap to skip
          </button>
        ) : ended ? (
          <div className="stack">
            <p className="result-banner">
              {real.winner === 'draw' ? 'DRAW' : real.winner === PLAYER ? 'VICTORY' : 'DEFEAT'}
            </p>
            <button className="btn btn-primary" onClick={() => onFinished(real)}>
              View incident report
            </button>
          </div>
        ) : waiting ? (
          <p className="notice" role="status">
            Waiting for {driver.opponent}…
          </p>
        ) : mustReplace ? (
          <div className="stack">
            <p className="section-label">DEPLOY A REPLACEMENT</p>
            <BenchList state={real} onPick={replace} />
          </div>
        ) : switching ? (
          <div className="stack">
            <p className="section-label">SWITCH TO</p>
            <BenchList state={real} onPick={(i) => act({ kind: 'switch', teamIndex: i })} only={switchOnly} />
            <button className="btn" onClick={() => setSwitching(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <div className="stack">
            {(info || !guide) && (
              <p className="move-info small muted" aria-live="polite">
                {info ?? 'Hold a move for details.'}
              </p>
            )}
            {struggling && (
              <button className="btn btn-primary" onClick={() => act({ kind: 'move', moveIndex: 0 })}>
                No PP left — {STRUGGLE.name}
              </button>
            )}
            <div className="moves">
              {mySpecies.moves.map((id, i) => {
                const m = ROSTER.moves[id]
                const tag = m.category === 'Status' ? '' : effectivenessTag(typeEffectiveness(m.type, foeTypes))
                const desc = `${m.name}: ${describeMove(m)}`
                return (
                  <button
                    key={id}
                    className={`move-btn${allow.kind === 'move' && moveAllowed(i) ? ' guided' : ''}`}
                    title={desc}
                    disabled={realActive.pp[i] <= 0 || !moveAllowed(i)}
                    onPointerDown={() => startPress(desc)}
                    onPointerUp={endPress}
                    onPointerLeave={endPress}
                    onContextMenu={(e) => e.preventDefault()}
                    onClick={() => {
                      if (longPressed.current) return
                      act({ kind: 'move', moveIndex: i })
                    }}
                  >
                    <span className="move-name">{m.name}</span>
                    <span className="move-meta">
                      <span className={`type-${m.type}`}>{TYPE_ABBR[m.type]}</span>
                      <span className="muted">
                        {m.category === 'Status' ? 'STATUS' : m.power} · {m.accuracy ?? '—'}
                        {m.accuracy !== null ? '%' : ''}
                      </span>
                      <span className={realActive.pp[i] <= 2 ? 'pp-low' : 'muted'}>
                        PP {realActive.pp[i]}/{m.pp}
                      </span>
                      {tag && <span className={`eff ${tag.startsWith('▲') ? 'eff-up' : 'eff-down'}`}>{tag}</span>}
                    </span>
                  </button>
                )
              })}
            </div>
            <button
              className={`btn${allow.kind === 'switch' ? ' guided' : ''}`}
              disabled={contained || benchOptions.length === 0 || !switchAllowed}
              onClick={() => setSwitching(true)}
            >
              {contained ? 'CONTAINED — CAN’T SWITCH' : `Switch (${benchOptions.length})`}
            </button>
          </div>
        )}
      </section>
    </main>
  )
}
