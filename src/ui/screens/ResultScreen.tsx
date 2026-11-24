import type { BattleState, SideIndex } from '../../engine'
import { ROSTER } from '../../data/roster'
import { HOSTILE, PLAYER } from '../battleLog'

function TeamReport({ state, side }: { state: BattleState; side: SideIndex }) {
  return (
    <div>
      {state.sides[side].team.map((c, i) => {
        const sp = ROSTER.species[c.speciesId]
        const pct = Math.ceil((c.hp / c.stats.hp) * 100)
        return (
          <div className="roster-line" key={i}>
            <span className={`class-${sp.objectClass}`}>{sp.name}</span>
            <span className={c.hp > 0 ? '' : 'muted'}>
              {c.hp <= 0
                ? 'NEUTRALIZED'
                : side === PLAYER
                  ? `${c.hp}/${c.stats.hp}`
                  : `${pct}%`}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function ResultScreen({
  final,
  opponent,
  onRematch,
  builderLabel = 'Change team',
  onBuilder,
  onTitle,
}: {
  final: BattleState
  /** The opponent's Callsign online; the AI is "the hostile site". */
  opponent?: string
  onRematch?: () => void
  builderLabel?: string
  onBuilder: () => void
  onTitle: () => void
}) {
  const outcome = final.winner === 'draw' ? 'DRAW' : final.winner === PLAYER ? 'VICTORY' : 'DEFEAT'
  const tone = final.winner === PLAYER ? 'win' : final.winner === HOSTILE ? 'loss' : ''
  const summary =
    final.winner === 'draw'
      ? 'Both sites lost containment.'
      : final.winner === PLAYER
        ? 'All hostile anomalies neutralized.'
        : 'Your containment team was lost.'
  return (
    <main className="screen">
      <p className="eyebrow">INCIDENT REPORT</p>
      <h2 className={`result-title ${tone}`}>{outcome}</h2>
      <p className="muted" style={{ textAlign: 'center', margin: 0 }}>
        {summary} Concluded on turn {final.turn}.
      </p>
      <section className="panel">
        <p className="section-label">YOUR TEAM</p>
        <TeamReport state={final} side={PLAYER} />
      </section>
      <section className="panel">
        <p className="section-label">{opponent?.toUpperCase() ?? 'HOSTILE SITE'}</p>
        <TeamReport state={final} side={HOSTILE} />
      </section>
      <div className="stack">
        {onRematch && (
          <button className="btn btn-primary" onClick={onRematch}>
            Rematch (same teams)
          </button>
        )}
        <button className={onRematch ? 'btn' : 'btn btn-primary'} onClick={onBuilder}>
          {builderLabel}
        </button>
        <button className="btn" onClick={onTitle}>
          Title screen
        </button>
      </div>
    </main>
  )
}
