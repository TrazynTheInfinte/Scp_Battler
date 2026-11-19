import { useEffect, useRef, useState } from 'react'
import {
  activeOf,
  switchTargets,
  typeEffectiveness,
  type BattleState,
  type Choice,
  type Combatant,
  type SideIndex,
} from '../../engine'
import { ROSTER } from '../../data/roster'
import { HOSTILE, PLAYER } from '../battleLog'
import {
  playerForfeit,
  playerMustReplace,
  playerReplace,
  playerTurn,
  type Session,
} from '../battleController'
import { ClassBadge, ContainmentCard, TypeBadge } from '../components'
import { TYPE_ABBR, describeMove, effectivenessTag } from '../text'

const LONG_PRESS_MS = 450

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
        <span className="muted small">
          {'●'.repeat(remaining)}
          {'○'.repeat(state.sides[side].team.length - remaining)}
        </span>
      </div>
      <HpBar c={c} exact={side === PLAYER} />
    </div>
  )
}

export function BattleScreen({
  initial,
  onRematch,
  onExit,
}: {
  initial: Session
  onRematch: () => void
  onExit: () => void
}) {
  const [session, setSession] = useState(initial)
  const [switching, setSwitching] = useState(false)
  const [confirmForfeit, setConfirmForfeit] = useState(false)
  const [info, setInfo] = useState<string | null>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const pressTimer = useRef<number | null>(null)
  const longPressed = useRef(false)

  const state = session.state
  const me = activeOf(state, PLAYER)
  const foe = activeOf(state, HOSTILE)
  const mySpecies = ROSTER.species[me.speciesId]
  const foeTypes = ROSTER.species[foe.speciesId].types
  const ended = state.phase === 'ended'
  const mustReplace = playerMustReplace(state)
  const contained = me.status?.name === 'Contained'
  const benchOptions = switchTargets(state, PLAYER)

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight })
  }, [session.log.length])

  const act = (choice: Choice) => {
    setSwitching(false)
    setInfo(null)
    setSession(playerTurn(session, choice).session)
  }
  const replace = (i: number) => setSession(playerReplace(session, i).session)
  const doForfeit = () => {
    setConfirmForfeit(false)
    setSession(playerForfeit(session).session)
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

  const benchList = (onPick: (i: number) => void) => (
    <div className="bench">
      {state.sides[PLAYER].team.map((c, i) => {
        const sp = ROSTER.species[c.speciesId]
        const available = benchOptions.includes(i)
        return (
          <button key={i} className="bench-item" disabled={!available} onClick={() => onPick(i)}>
            <span>
              <strong>{sp.name}</strong>
              {i === state.sides[PLAYER].active && <span className="muted small"> · ACTIVE</span>}
              {c.status && <span className="badge status-badge">{c.status.name.toUpperCase()}</span>}
            </span>
            <span className={c.hp > 0 ? 'small' : 'small muted'}>
              {c.hp > 0 ? `${c.hp}/${c.stats.hp}` : 'NEUTRALIZED'}
            </span>
          </button>
        )
      })}
    </div>
  )

  return (
    <main className="screen battle">
      <div className="screen-head">
        <span className="muted small">TURN {state.turn}</span>
        {!ended &&
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
      </div>

      <section className="field">
        <div className="field-row hostile">
          <SideInfo state={state} side={HOSTILE} />
          <div className="field-art">
            <ContainmentCard speciesId={foe.speciesId} />
          </div>
        </div>
        <div className="field-row own">
          <div className="field-art">
            <ContainmentCard speciesId={me.speciesId} />
          </div>
          <SideInfo state={state} side={PLAYER} />
        </div>
      </section>

      <div className="log" ref={logRef} aria-live="polite">
        {session.log.slice(-40).map((line, i) => (
          <p key={session.log.length - 40 + i}>&gt; {line}</p>
        ))}
      </div>

      <section className="controls">
        {ended ? (
          <div className="stack">
            <p className="result-banner">
              {state.winner === 'draw' ? 'DRAW' : state.winner === PLAYER ? 'VICTORY' : 'DEFEAT'}
            </p>
            <button className="btn btn-primary" onClick={onRematch}>
              Rematch
            </button>
            <button className="btn" onClick={onExit}>
              Back to Team Builder
            </button>
          </div>
        ) : mustReplace ? (
          <div className="stack">
            <p className="section-label">DEPLOY A REPLACEMENT</p>
            {benchList(replace)}
          </div>
        ) : switching ? (
          <div className="stack">
            <p className="section-label">SWITCH TO</p>
            {benchList((i) => act({ kind: 'switch', teamIndex: i }))}
            <button className="btn" onClick={() => setSwitching(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <div className="stack">
            <p className="move-info small muted" aria-live="polite">
              {info ?? 'Hold a move for details.'}
            </p>
            <div className="moves">
              {mySpecies.moves.map((id, i) => {
                const m = ROSTER.moves[id]
                const tag = m.category === 'Status' ? '' : effectivenessTag(typeEffectiveness(m.type, foeTypes))
                const desc = `${m.name}: ${describeMove(m)}`
                return (
                  <button
                    key={id}
                    className="move-btn"
                    title={desc}
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
                      {tag && <span className={`eff ${tag.startsWith('▲') ? 'eff-up' : 'eff-down'}`}>{tag}</span>}
                    </span>
                  </button>
                )
              })}
            </div>
            <button
              className="btn"
              disabled={contained || benchOptions.length === 0}
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
