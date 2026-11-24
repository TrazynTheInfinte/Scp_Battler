import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { ALL_TYPES, MUNDANE, OBJECT_CLASS_COST, matchup, type ObjectClass, type TypeName } from '../engine'
import { ART_SOURCE, DOSSIERS } from '../data/dossiers'
import { ROSTER, isExplained, isOperative } from '../data/roster'
import type { ScreenGuide } from './screenGuides'
import { STAT_LABEL, TYPE_ABBR, describeMove } from './text'

export function ClassBadge({ objectClass }: { objectClass: ObjectClass }) {
  return (
    <span className={`badge class-${objectClass}`}>
      {objectClass.toUpperCase()} · {OBJECT_CLASS_COST[objectClass]}
    </span>
  )
}

export function TypeBadge({ type }: { type: TypeName }) {
  return <span className={`badge type-${type}`}>{type}</span>
}

/** The Equipment an SCP carries, with its effect on hover; nothing if it carries none. */
export function EquipmentTag({ id }: { id: string | null }) {
  const piece = id ? ROSTER.equipment[id] : null
  if (!piece) return null
  return (
    <span className="badge equipment-badge" title={piece.description}>
      ⚙ {piece.name}
    </span>
  )
}

/** The SCP's art: its licensed image if it has one, else a placeholder card. */
export function ContainmentCard({ speciesId }: { speciesId: string }) {
  const sp = ROSTER.species[speciesId]
  const hasArt = Boolean(ART_SOURCE[speciesId])
  const operative = isOperative(speciesId)
  return (
    <div className="card-art" role="img" aria-label={`${sp.name} image`}>
      {hasArt && <img src={`${import.meta.env.BASE_URL}scp/${speciesId}.jpg`} alt="" loading="lazy" />}
      <div className={`card-band class-${sp.objectClass}`}>{sp.objectClass.toUpperCase()}</div>
      {!hasArt && (
        <div className="card-body">
          <div className="card-label">{operative ? 'OPERATIVE' : 'SCP'}</div>
          <div className={`card-number${operative || isExplained(speciesId) ? ' card-name' : ''}`}>
            {sp.name.replace('SCP-', '')}
          </div>
          <div className="card-types">{sp.types.map((t) => TYPE_ABBR[t]).join(' · ')}</div>
        </div>
      )}
    </div>
  )
}

const STAT_ORDER = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as const
const STAT_MAX = 150

/** Expandable roster entry: summary row, and full stats/ability/moves when open. */
export function DossierCard({
  speciesId,
  open,
  onToggle,
  inTeam,
  action,
}: {
  speciesId: string
  open: boolean
  onToggle: () => void
  inTeam: boolean
  action: React.ReactNode
}) {
  const sp = ROSTER.species[speciesId]
  const dossier = DOSSIERS[speciesId]
  const ability = sp.ability ? ROSTER.abilities[sp.ability] : null
  return (
    <article className={`dossier${inTeam ? ' in-team' : ''}`}>
      <button className="dossier-head" onClick={onToggle} aria-expanded={open}>
        <div className="dossier-thumb">
          <ContainmentCard speciesId={speciesId} />
        </div>
        <div className="dossier-title">
          <strong>
            {sp.name} {inTeam && <span className="muted small">· IN TEAM</span>}
          </strong>
          <span className="muted">{dossier.nickname}</span>
          <div className="row" style={{ gap: 4, marginTop: 4 }}>
            <ClassBadge objectClass={sp.objectClass} />
            {sp.types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>
        </div>
        <span className="muted" aria-hidden>
          {open ? '▾' : '▸'}
        </span>
      </button>
      {open && (
        <div className="dossier-body">
          <div className="dossier-top">
            <ContainmentCard speciesId={speciesId} />
            <div className="stack" style={{ gap: 4 }}>
              {STAT_ORDER.map((stat) => (
                <div className="stat-row" key={stat}>
                  <span className="muted">{STAT_LABEL[stat]}</span>
                  <span>{sp.baseStats[stat]}</span>
                  <div className="stat-bar">
                    <span style={{ width: `${Math.min(100, (sp.baseStats[stat] / STAT_MAX) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {ability && (
            <div>
              <p className="section-label">ABILITY</p>
              <strong>{ability.name}</strong>
              <span className="muted small"> — {ability.description}</span>
            </div>
          )}
          <div>
            <p className="section-label">MOVES</p>
            <ul className="move-list">
              {sp.moves.map((id) => {
                const m = ROSTER.moves[id]
                return (
                  <li key={id}>
                    <strong>{m.name}</strong> <TypeBadge type={m.type} />
                    <span className="muted">{describeMove(m)}</span>
                  </li>
                )
              })}
            </ul>
          </div>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="small">
              <a href={dossier.wikiUrl} target="_blank" rel="noreferrer">
                Read the SCP Wiki article ↗
              </a>
              {dossier.mature && <span className="mature-note"> · Mature content</span>}
            </span>
            {action}
          </div>
        </div>
      )}
    </article>
  )
}

/** "Type Chart" button that opens the attacker-vs-defender grid in a popup. */
/** A dialog over the screen; Escape, ✕ or a click outside closes it. */
function Overlay({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="overlay-panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="screen-head">
          <h2>{title.toUpperCase()}</h2>
          <button className="btn btn-small" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

/** A screen's parts and what each does, as a list. */
export function ScreenGuideList({ guide }: { guide: ScreenGuide }) {
  return (
    <dl className="screen-guide">
      {guide.parts.map(([part, what]) => (
        <div key={part}>
          <dt>{part}</dt>
          <dd>{what}</dd>
        </div>
      ))}
    </dl>
  )
}

/** The ? button: explains each part of the current screen. */
export function ScreenGuideButton({ guide }: { guide: ScreenGuide }) {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  return (
    <>
      <button className="btn btn-small" onClick={() => setOpen(true)} aria-label={`What's on the ${guide.title} screen`} title="Screen guide">
        ?
      </button>
      {open && (
        <Overlay title={`${guide.title} guide`} onClose={close}>
          <ScreenGuideList guide={guide} />
        </Overlay>
      )}
    </>
  )
}

export function TypeChartButton() {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  return (
    <>
      <button className="btn btn-small" onClick={() => setOpen(true)}>
        Type Chart
      </button>
      {open && (
        <Overlay title="Type chart" onClose={close}>
          <table className="type-chart">
            <thead>
              <tr>
                <th className="corner">ATK ↓ DEF →</th>
                {ALL_TYPES.map((d) => (
                  <th key={d} className={`type-${d}${d === MUNDANE ? ' off-ring' : ''}`} scope="col" title={d}>
                    {TYPE_ABBR[d]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_TYPES.map((a) => (
                <tr key={a} className={a === MUNDANE ? 'off-ring' : undefined}>
                  <th className={`type-${a}`} scope="row">
                    {a}
                  </th>
                  {ALL_TYPES.map((d) => {
                    const m = matchup(a, d)
                    const cls = [m === 2 ? 'super' : m === 0.5 ? 'resist' : '', d === MUNDANE ? 'off-ring' : '']
                    return (
                      <td key={d} className={cls.filter(Boolean).join(' ') || undefined}>
                        {m === 2 ? '2' : m === 0.5 ? '½' : ''}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="small muted">
            Row = the move's type, column = the defender's type. Blank is ×1. Against an SCP with two types, both
            numbers multiply (up to ×4 or ×¼). Mundane is outside the ring: always ×1.
          </p>
        </Overlay>
      )}
    </>
  )
}
