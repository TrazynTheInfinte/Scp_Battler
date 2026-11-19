import { ABILITIES, OBJECT_CLASS_COST, type ObjectClass, type TypeName } from '../engine'
import { ART_SOURCE, DOSSIERS } from '../data/dossiers'
import { ROSTER } from '../data/roster'
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

/** The SCP's art: its licensed image if it has one, else a placeholder card. */
export function ContainmentCard({ speciesId }: { speciesId: string }) {
  const sp = ROSTER.species[speciesId]
  const hasArt = Boolean(ART_SOURCE[speciesId])
  return (
    <div className="card-art" role="img" aria-label={`${sp.name} image`}>
      {hasArt && <img src={`${import.meta.env.BASE_URL}scp/${speciesId}.jpg`} alt="" loading="lazy" />}
      <div className={`card-band class-${sp.objectClass}`}>{sp.objectClass.toUpperCase()}</div>
      {!hasArt && (
        <div className="card-body">
          <div className="card-label">SCP</div>
          <div className="card-number">{sp.name.replace('SCP-', '')}</div>
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
  const ability = sp.ability ? ABILITIES[sp.ability] : null
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
            <a className="small" href={dossier.wikiUrl} target="_blank" rel="noreferrer">
              Read the SCP Wiki article ↗
            </a>
            {action}
          </div>
        </div>
      )}
    </article>
  )
}
