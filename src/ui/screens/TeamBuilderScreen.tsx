import { useMemo, useState } from 'react'
import { randomTeam } from '../../ai'
import {
  OBJECT_CLASS_COST,
  TEAM_BUDGET,
  TEAM_SIZE,
  createRng,
  teamCost,
  validateTeam,
  TYPE_RING,
  type ObjectClass,
  type TypeName,
} from '../../engine'
import { DOSSIERS } from '../../data/dossiers'
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
  const cost = teamCost(ROSTER, team) + OBJECT_CLASS_COST[ROSTER.species[id].objectClass]
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

export function TeamBuilderScreen({
  team,
  setTeam,
  onBack,
  onBattle,
}: {
  team: string[]
  setTeam: (team: string[]) => void
  onBack: () => void
  onBattle: () => void
}) {
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
  const legal = validateTeam(ROSTER, team).length === 0
  const overBudget = cost > TEAM_BUDGET

  const add = (id: string) => {
    const blocker = addBlocker(team, id)
    if (blocker) return setNotice(blocker)
    setNotice(null)
    setTeam([...team, id])
  }
  const remove = (id: string) => {
    setNotice(null)
    setTeam(team.filter((t) => t !== id))
  }
  const randomize = () => {
    setNotice(null)
    setTeam(randomTeam(ROSTER, createRng(Date.now() >>> 0), ROSTER_ORDER))
  }
  const save = () => {
    const result = saveTeam(storage, ROSTER, name, team)
    if (!result.ok) return setNotice(SAVE_ERRORS[result.reason])
    setSaved(result.teams)
    setNotice(`Saved "${name.trim().slice(0, MAX_NAME_LENGTH)}".`)
  }
  const load = (t: SavedTeam) => {
    setTeam([...t.speciesIds])
    setName(t.name)
    setShowSaved(false)
    const tCost = teamCost(ROSTER, t.speciesIds)
    setNotice(
      tCost > TEAM_BUDGET
        ? `Loaded "${t.name}", but it's over budget (${tCost}/${TEAM_BUDGET}) since costs changed. Swap an SCP out.`
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
            return (
              <button
                key={i}
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
        <p className="notice" role="status">
          {notice ??
            (legal
              ? 'Team ready.'
              : overBudget
                ? `Over budget (${cost}/${TEAM_BUDGET}). Remove an SCP to fix it.`
                : `Pick ${TEAM_SIZE - team.length} more. ${COST_HINT}.`)}
        </p>
        <div className="row">
          <button className="btn btn-primary" style={{ flex: 1 }} disabled={!legal} onClick={onBattle}>
            Battle
          </button>
          <button className="btn" onClick={() => setShowSaved((s) => !s)} aria-expanded={showSaved}>
            Saved ({saved.length}/{MAX_SAVED_TEAMS})
          </button>
        </div>
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
                  {teamCost(ROSTER, t.speciesIds) > TEAM_BUDGET && (
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
