import { useMemo, useState } from 'react'
import { randomEquipment, randomTeam } from '../../ai'
import {
  CLASS_LIMIT,
  EQUIPMENT_ALLOWANCE,
  OBJECT_CLASS_COST,
  TEAM_BUDGET,
  TEAM_SIZE,
  createRng,
  equipmentBudget,
  equipmentCost,
  teamCost,
  validateTeam,
  TYPE_RING,
  type ObjectClass,
  type TypeName,
} from '../../engine'
import { DOSSIERS } from '../../data/dossiers'
import { EQUIPMENT_ORDER } from '../../data/equipment'
import { ROSTER, ROSTER_ORDER } from '../../data/roster'
import { DossierCard, TypeChartButton } from '../components'
import { NO_FILTER, filterRoster, isFiltering, type RosterFilter } from '../rosterFilter'
import { useToggle } from '../hooks'
import {
  MAX_NAME_LENGTH,
  MAX_SAVED_TEAMS,
  browserStorage,
  deleteTeam,
  loadTeams,
  saveTeam,
  type SavedTeam,
} from '../savedTeams'

/** Why an SCP can't be added right now, or null if it can. */
function addBlocker(team: readonly string[], id: string): string | null {
  if (team.includes(id)) return 'Already on your team.'
  if (team.length >= TEAM_SIZE) return `Team is full (${TEAM_SIZE} SCPs).`
  const objectClass = ROSTER.species[id].objectClass
  const limit = CLASS_LIMIT[objectClass]
  if (limit !== undefined && team.filter((t) => ROSTER.species[t].objectClass === objectClass).length >= limit) {
    return `Only ${limit} ${objectClass} per team.`
  }
  const cost = teamCost(ROSTER, team) + OBJECT_CLASS_COST[objectClass]
  if (cost > TEAM_BUDGET) return `Over budget: would cost ${cost}/${TEAM_BUDGET}.`
  return null
}

/** The object classes on the roster, cheapest first. */
const ROSTER_CLASSES = (Object.keys(OBJECT_CLASS_COST) as ObjectClass[]).filter((c) =>
  ROSTER_ORDER.some((id) => ROSTER.species[id].objectClass === c),
)
/** e.g. "Safe 1 · Euclid 3 · Keter 4". */
const COST_HINT = ROSTER_CLASSES.map((c) => `${c} ${OBJECT_CLASS_COST[c]}`).join(' · ')

/** Toggle `value` in a set, returning a new set. */
function toggled<T>(set: ReadonlySet<T>, value: T): Set<T> {
  const next = new Set(set)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  return next
}

/** Type and object-class checkboxes. Ticks within a group widen; groups narrow each other. */
function FilterPanel({
  filter,
  setFilter,
  open,
}: {
  filter: RosterFilter
  setFilter: (f: RosterFilter) => void
  open: boolean
}) {
  return (
    <aside id="roster-filters" className={`filter-panel${open ? ' open' : ''}`} aria-label="Filters">
      <fieldset>
        <legend className="section-label">TYPE</legend>
        {TYPE_RING.map((t: TypeName) => (
          <label key={t} className={`filter-option type-${t}`}>
            <input
              type="checkbox"
              checked={filter.types.has(t)}
              onChange={() => setFilter({ ...filter, types: toggled(filter.types, t) })}
            />
            {t}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend className="section-label">OBJECT CLASS</legend>
        {ROSTER_CLASSES.map((c) => (
          <label key={c} className={`filter-option class-${c}`}>
            <input
              type="checkbox"
              checked={filter.classes.has(c)}
              onChange={() => setFilter({ ...filter, classes: toggled(filter.classes, c) })}
            />
            {c}
          </label>
        ))}
      </fieldset>
    </aside>
  )
}

const SAVE_ERRORS = {
  emptyName: 'Give the team a name first.',
  full: `All ${MAX_SAVED_TEAMS} save slots are used. Delete one or reuse a name.`,
  illegal: 'Only complete, legal teams can be saved.',
  storage: "This browser isn't letting the game save (private mode?).",
} as const

/** One slot's Equipment picker: pieces another slot carries, or that cost more than is left, are disabled. */
function EquipmentSelect({
  slot,
  equipment,
  left,
  onChange,
}: {
  slot: number
  equipment: readonly (string | null)[]
  /** Points still free for Equipment, not counting this slot's own piece. */
  left: number
  onChange: (id: string | null) => void
}) {
  const current = equipment[slot]
  return (
    <select
      className="equip-select"
      value={current ?? ''}
      onChange={(e) => onChange(e.target.value || null)}
      aria-label={`Equipment for slot ${slot + 1}`}
    >
      <option value="">No equipment</option>
      {EQUIPMENT_ORDER.map((id) => {
        const piece = ROSTER.equipment[id]
        const taken = id !== current && equipment.includes(id)
        return (
          <option key={id} value={id} disabled={taken || piece.cost > left}>
            {piece.name} ({piece.cost})
          </option>
        )
      })}
    </select>
  )
}

export function TeamBuilderScreen({
  team,
  setTeam,
  equipment: rawEquipment,
  setEquipment,
  onBack,
  onBattle,
}: {
  team: string[]
  setTeam: (team: string[]) => void
  /** Aligned with `team`: each SCP's Equipment id, or null. */
  equipment: (string | null)[]
  setEquipment: (equipment: (string | null)[]) => void
  onBack: () => void
  onBattle: () => void
}) {
  const equipment = team.map((_, i) => rawEquipment[i] ?? null)
  const [showEquipment, setShowEquipment] = useState(false)
  // Dev-only: ?open=<speciesId> starts with that dossier expanded (for screenshot checks).
  const [open, toggle] = useToggle(
    import.meta.env.DEV ? new URLSearchParams(window.location.search).get('open') : null,
  )
  const [notice, setNotice] = useState<string | null>(null)
  const storage = useMemo(() => browserStorage(), [])
  const [saved, setSaved] = useState<SavedTeam[]>(() => loadTeams(storage, ROSTER))
  const [showSaved, setShowSaved] = useState(false)
  const [name, setName] = useState('')
  const [filter, setFilter] = useState<RosterFilter>(NO_FILTER)
  const [showFilters, setShowFilters] = useState(false)
  const shown = useMemo(() => filterRoster(ROSTER, ROSTER_ORDER, DOSSIERS, filter), [filter])
  const activeFilters = filter.types.size + filter.classes.size

  const cost = teamCost(ROSTER, team)
  const gearCost = equipmentCost(ROSTER, equipment)
  const gearBudget = equipmentBudget(ROSTER, team)
  const legal = validateTeam(ROSTER, team, equipment).length === 0
  const overBudget = cost > TEAM_BUDGET
  const gearOverBudget = gearCost > gearBudget

  const add = (id: string) => {
    const blocker = addBlocker(team, id)
    if (blocker) return setNotice(blocker)
    setNotice(null)
    setTeam([...team, id])
    setEquipment([...equipment, null])
  }
  const remove = (id: string) => {
    setNotice(null)
    const slot = team.indexOf(id)
    setTeam(team.filter((t) => t !== id))
    setEquipment(equipment.filter((_, i) => i !== slot))
  }
  const equip = (slot: number, id: string | null) => {
    setNotice(null)
    setEquipment(equipment.map((e, i) => (i === slot ? id : e)))
  }
  const randomize = () => {
    setNotice(null)
    const rng = createRng(Date.now() >>> 0)
    const next = randomTeam(ROSTER, rng, ROSTER_ORDER)
    setTeam(next)
    setEquipment(randomEquipment(ROSTER, rng, next))
  }
  const save = () => {
    const result = saveTeam(storage, ROSTER, name, team, equipment)
    if (!result.ok) return setNotice(SAVE_ERRORS[result.reason])
    setSaved(result.teams)
    setNotice(`Saved "${name.trim().slice(0, MAX_NAME_LENGTH)}".`)
  }
  const load = (t: SavedTeam) => {
    setTeam([...t.speciesIds])
    setEquipment(t.speciesIds.map((_, i) => t.equipment?.[i] ?? null))
    setName(t.name)
    setShowSaved(false)
    setNotice(
      validateTeam(ROSTER, t.speciesIds, t.equipment).length > 0
        ? `Loaded "${t.name}", but it's over budget since costs changed. Swap an SCP or Equipment out.`
        : `Loaded "${t.name}".`,
    )
  }
  const del = (t: SavedTeam) => {
    const result = deleteTeam(storage, ROSTER, t.name)
    if (result.ok) setSaved(result.teams)
  }

  return (
    <main className="screen builder-screen">
      <div className="screen-head wrap">
        <button className="btn btn-small" onClick={onBack}>
          ← Back
        </button>
        <h2>TEAM BUILDER</h2>
        <span className="row" style={{ flexWrap: 'nowrap', gap: 6 }}>
          <TypeChartButton />
          <button className="btn btn-small" onClick={randomize}>
            Random
          </button>
        </span>
      </div>

      <div className="builder-pinned">
        <div className="slots">
          {Array.from({ length: TEAM_SIZE }, (_, i) => {
            const id = team[i]
            const ownCost = equipment[i] ? ROSTER.equipment[equipment[i]].cost : 0
            return (
              <div key={i} className="slot-cell">
                <button
                  className={`slot${id ? ' filled' : ''}`}
                  onClick={() => id && remove(id)}
                  aria-label={id ? `Remove ${ROSTER.species[id].name}` : `Empty slot ${i + 1}`}
                >
                  {id ? (
                    <span className={`class-${ROSTER.species[id].objectClass}`}>
                      {ROSTER.species[id].name.replace('SCP-', '')}
                      <br />
                      <span className="muted">✕</span>
                    </span>
                  ) : (
                    `SLOT ${i + 1}`
                  )}
                </button>
                {id && (
                  <EquipmentSelect
                    slot={i}
                    equipment={equipment}
                    left={gearBudget - gearCost + ownCost}
                    onChange={(e) => equip(i, e)}
                  />
                )}
              </div>
            )
          })}
        </div>
        <div className="budget">
          <span>BUDGET</span>
          <div className="meter" aria-hidden>
            <span style={{ width: `${Math.min(100, (cost / TEAM_BUDGET) * 100)}%` }} />
          </div>
          <span>
            {cost}/{TEAM_BUDGET}
          </span>
        </div>
        {team.length > 0 && (
        <div className="budget">
          <span>EQUIPMENT</span>
          <div className={`meter${gearOverBudget ? ' over' : ''}`} aria-hidden>
            <span style={{ width: `${Math.min(100, (gearCost / gearBudget) * 100)}%` }} />
          </div>
          <span>
            {gearCost}/{gearBudget}
          </span>
        </div>
        )}
        <p className="notice" role="status">
          {notice ??
            (legal
              ? 'Team ready.'
              : overBudget
                ? `Over budget (${cost}/${TEAM_BUDGET}). Remove an SCP to fix it.`
                : gearOverBudget
                  ? `Equipment over budget (${gearCost}/${gearBudget}). Remove a piece to fix it.`
                  : `Pick ${TEAM_SIZE - team.length} more. ${COST_HINT}.`)}
        </p>
        <div className="row">
          <button className="btn btn-primary" style={{ flex: 1 }} disabled={!legal} onClick={onBattle}>
            Battle
          </button>
          <button className="btn" onClick={() => setShowEquipment((v) => !v)} aria-expanded={showEquipment}>
            Equipment
          </button>
          <button className="btn" onClick={() => setShowSaved((s) => !s)} aria-expanded={showSaved}>
            Saved ({saved.length}/{MAX_SAVED_TEAMS})
          </button>
        </div>
        {showEquipment && (
          <div className="panel stack">
            <p className="small muted">
              Each SCP can carry one piece; each piece once per team. You get {EQUIPMENT_ALLOWANCE} points for
              Equipment only, plus whatever your SCPs leave of the {TEAM_BUDGET}-point budget.
            </p>
            {EQUIPMENT_ORDER.map((id) => {
              const piece = ROSTER.equipment[id]
              return (
                <div key={id} className="small">
                  <strong>{piece.name}</strong> <span className="muted">· {piece.cost}</span> — {piece.description}
                </div>
              )
            })}
          </div>
        )}
        {showSaved && (
          <div className="panel stack">
            <div className="row">
              <input
                className="text-input"
                value={name}
                maxLength={MAX_NAME_LENGTH}
                placeholder="Team name"
                onChange={(e) => setName(e.target.value)}
                aria-label="Team name"
              />
              <button className="btn btn-small" onClick={save} disabled={!legal}>
                Save
              </button>
            </div>
            {saved.length === 0 && <p className="muted small">No saved teams yet.</p>}
            {saved.map((t) => (
              <div className="saved-row" key={t.name}>
                <div>
                  <strong>{t.name}</strong>
                  {validateTeam(ROSTER, t.speciesIds, t.equipment).length > 0 && (
                    <span className="badge status-badge">OVER BUDGET</span>
                  )}
                  <div className="muted small">
                    {t.speciesIds.map((id) => ROSTER.species[id].name.replace('SCP-', '')).join(' · ')}
                  </div>
                </div>
                <div className="row" style={{ flexWrap: 'nowrap' }}>
                  <button className="btn btn-small" onClick={() => load(t)}>
                    Load
                  </button>
                  <button className="btn-link" onClick={() => del(t)}>
                    delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="builder-body">
        <div className="row builder-search" style={{ flexWrap: 'nowrap' }}>
          <input
            className="text-input"
            type="search"
            placeholder="Name or number"
            aria-label="Search SCPs by number, name, or nickname"
            value={filter.query}
            onChange={(e) => setFilter({ ...filter, query: e.target.value })}
          />
          <button
            className="btn btn-small filters-toggle"
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
            aria-controls="roster-filters"
          >
            Filters{activeFilters > 0 ? ` (${activeFilters})` : ''}
          </button>
        </div>
        <FilterPanel filter={filter} setFilter={setFilter} open={showFilters} />
        <div className="stack builder-list">
          <div className="row small muted" style={{ justifyContent: 'space-between' }}>
            <span aria-live="polite">
              Showing {shown.length} of {ROSTER_ORDER.length}
            </span>
            {isFiltering(filter) && (
              <button className="btn-link" onClick={() => setFilter(NO_FILTER)}>
                Clear filters
              </button>
            )}
          </div>
          {shown.length === 0 && <p className="muted small">No SCPs match.</p>}
          {shown.map((id) => {
            const inTeam = team.includes(id)
            const blocker = addBlocker(team, id)
            return (
              <DossierCard
                key={id}
                speciesId={id}
                open={open === id}
                onToggle={() => toggle(id)}
                inTeam={inTeam}
                action={
                  inTeam ? (
                    <button className="btn btn-small" onClick={() => remove(id)}>
                      Remove
                    </button>
                  ) : (
                    <button
                      className="btn btn-small btn-primary"
                      onClick={() => add(id)}
                      aria-disabled={blocker !== null}
                      style={blocker ? { opacity: 0.45 } : undefined}
                    >
                      Add
                    </button>
                  )
                }
              />
            )
          })}
        </div>
      </div>
    </main>
  )
}
