import { useMemo, useState } from 'react'
import { randomEquipment, randomTeam } from '../../ai'
import { OPPONENTS, type OpponentKind } from '../../ai/opponents'
import {
  CLASS_LIMIT,
  EQUIPMENT_ALLOWANCE,
  OBJECT_CLASS_COST,
  TEAM_BUDGET,
  TEAM_SIZE,
  createRng,
  equipmentBudget,
  equipmentCost,
  equipmentHasEffect,
  teamCost,
  validateTeam,
  ALL_TYPES,
  type ObjectClass,
  type TypeName,
} from '../../engine'
import { DOSSIERS } from '../../data/dossiers'
import { EQUIPMENT_ORDER } from '../../data/equipment'
import { GIFT_ORDER, ROSTER, ROSTER_ORDER } from '../../data/roster'
import { lockedGifts } from '../../online/accountData'
import { DossierCard, ScreenGuideButton, TypeChartButton } from '../components'
import { TEAM_BUILDER_GUIDE } from '../screenGuides'
import { NO_FILTER, filterRoster, isFiltering, type RosterFilter } from '../rosterFilter'
import { useToggle } from '../hooks'
import { MAX_NAME_LENGTH, MAX_SAVED_TEAMS, type SavedTeam } from '../savedTeams'
import type { TeamShelf } from '../teamShelf'
import { readOpponentKind, writeOpponentKind } from '../opponentChoice'

/** What a saved team breaks under the current rules (it still loads, so it can be fixed), or null. */
function savedTeamProblem(t: SavedTeam, grants: readonly string[]): string | null {
  if (lockedGifts(t.speciesIds, grants, ROSTER).length > 0) return 'locked gift'
  const p = validateTeam(ROSTER, t.speciesIds, t.equipment)[0]
  if (!p) return null
  if (p.kind === 'classLimit') return `too many ${p.objectClass}`
  return 'over budget'
}

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
        {ALL_TYPES.map((t: TypeName) => (
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

/** Whether the team panel is hidden down to one line; remembered per browser. */
const COLLAPSED_KEY = 'scp-battler:builder-collapsed:v1'
function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === '1'
  } catch {
    return false
  }
}
function writeCollapsed(collapsed: boolean) {
  try {
    localStorage.setItem(COLLAPSED_KEY, collapsed ? '1' : '0')
  } catch {
    // Storage blocked: it just won't be remembered.
  }
}

const SAVE_ERRORS = {
  emptyName: 'Give the team a name first.',
  full: `All ${MAX_SAVED_TEAMS} save slots are used. Delete one or reuse a name.`,
  illegal: 'Only complete, legal teams can be saved.',
  storage: "Couldn't save. Check your connection, or this browser may be blocking storage (private mode?).",
  offline: "You're offline, so saving is paused. Try again once you're connected.",
} as const

/** One slot's Equipment picker: pieces another slot carries, or that cost more than is left, are disabled. */
function EquipmentSelect({
  slot,
  speciesId,
  equipment,
  left,
  onChange,
}: {
  slot: number
  speciesId: string
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
        const useless = !equipmentHasEffect(ROSTER, speciesId, id)
        return (
          <option key={id} value={id} disabled={taken || useless || piece.cost > left}>
            {piece.name} ({piece.cost}){useless ? ' — no effect, already heals' : ''}
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
  shelf,
  onBack,
  onBattle,
  grants,
}: {
  team: string[]
  setTeam: (team: string[]) => void
  /** Aligned with `team`: each SCP's Equipment id, or null. */
  equipment: (string | null)[]
  setEquipment: (equipment: (string | null)[]) => void
  shelf: TeamShelf
  onBack: () => void
  onBattle: (opponent: OpponentKind) => void
  /** Gift SCPs the signed-in Account holds; empty when signed out. */
  grants: readonly string[]
}) {
  const [opponent, setOpponentState] = useState<OpponentKind>(readOpponentKind)
  const setOpponent = (kind: OpponentKind) => {
    setOpponentState(kind)
    writeOpponentKind(kind)
  }
  const battle = () => onBattle(opponent)
  const equipment = team.map((_, i) => rawEquipment[i] ?? null)
  const [showEquipment, setShowEquipment] = useState(false)
  // Dev-only: ?open=<speciesId> starts with that dossier expanded (for screenshot checks).
  const [open, toggle] = useToggle(
    import.meta.env.DEV ? new URLSearchParams(window.location.search).get('open') : null,
  )
  const [notice, setNotice] = useState<string | null>(null)
  const saved = shelf.teams
  const [showSaved, setShowSaved] = useState(false)
  const [name, setName] = useState('')
  const [filter, setFilter] = useState<RosterFilter>(NO_FILTER)
  const [showFilters, setShowFilters] = useState(false)
  const [collapsed, setCollapsedState] = useState(readCollapsed)
  const setCollapsed = (c: boolean) => {
    setCollapsedState(c)
    writeCollapsed(c)
  }
  // The Account's Gift SCPs come first, so they're easy to find.
  const available = useMemo(() => [...GIFT_ORDER.filter((id) => grants.includes(id)), ...ROSTER_ORDER], [grants])
  const shown = useMemo(() => filterRoster(ROSTER, available, DOSSIERS, filter), [available, filter])
  const activeFilters = filter.types.size + filter.classes.size

  const cost = teamCost(ROSTER, team)
  const gearCost = equipmentCost(ROSTER, equipment)
  const gearBudget = equipmentBudget(ROSTER, team)
  // A saved team may hold a Gift SCP this Account doesn't (signed out, or the Grant was taken back).
  const locked = lockedGifts(team, grants, ROSTER)
  const legal = validateTeam(ROSTER, team, equipment).length === 0 && locked.length === 0
  const overBudget = cost > TEAM_BUDGET
  const gearOverBudget = gearCost > gearBudget
  const classProblem = validateTeam(ROSTER, team, equipment).find((p) => p.kind === 'classLimit')

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
  const save = async () => {
    const result = await shelf.save(name, team, equipment)
    setNotice(result.ok ? `Saved "${name.trim().slice(0, MAX_NAME_LENGTH)}".` : SAVE_ERRORS[result.reason])
  }
  const load = (t: SavedTeam) => {
    setTeam([...t.speciesIds])
    setEquipment(t.speciesIds.map((_, i) => t.equipment?.[i] ?? null))
    setName(t.name)
    setShowSaved(false)
    const problem = savedTeamProblem(t, grants)
    setNotice(
      problem
        ? `Loaded "${t.name}", but the rules changed since you saved it: ${problem}. Swap something out to fix it.`
        : `Loaded "${t.name}".`,
    )
  }
  const del = async (t: SavedTeam) => {
    const result = await shelf.remove(t.name)
    if (!result.ok) setNotice(SAVE_ERRORS[result.reason])
  }

  return (
    <main className={`screen builder-screen${collapsed ? ' team-collapsed' : ''}`}>
      <div className="screen-head wrap">
        <button className="btn btn-small" onClick={onBack}>
          ← Back
        </button>
        <h2>TEAM BUILDER</h2>
        <span className="row" style={{ flexWrap: 'nowrap', gap: 6 }}>
          <ScreenGuideButton guide={TEAM_BUILDER_GUIDE} />
          <TypeChartButton />
          <button className="btn btn-small" onClick={randomize}>
            Random
          </button>
        </span>
      </div>

      {collapsed ? (
        <div className="builder-pinned">
          <div className="row" style={{ flexWrap: 'nowrap' }}>
            <button className="btn btn-small" onClick={() => setCollapsed(false)} aria-expanded={false}>
              ▾ Show
            </button>
            <span className="small" style={{ flex: 1 }}>
              {team.length}/{TEAM_SIZE} SCPs · {cost}/{TEAM_BUDGET} pts
            </span>
            <button className="btn btn-small btn-primary" disabled={!legal} onClick={battle}>
              Battle
            </button>
          </div>
          {notice && (
            <p className="notice" role="status">
              {notice}
            </p>
          )}
        </div>
      ) : (
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
                        {locked.includes(id) && '🔒 '}
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
                      speciesId={id}
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
            <button className="btn btn-small" onClick={() => setCollapsed(true)} aria-expanded title="Shrink the team panel to one line">
              ▴ Hide
            </button>
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
              (locked.length > 0
                ? `${locked.map((id) => ROSTER.species[id].name).join(', ')}: a Gift SCP this Account doesn't hold. Swap it out to battle.`
                : legal
                ? 'Team ready.'
                : overBudget
                  ? `Over budget (${cost}/${TEAM_BUDGET}). Remove an SCP to fix it.`
                  : classProblem
                    ? `Only ${CLASS_LIMIT[classProblem.objectClass]} ${classProblem.objectClass} per team. Remove one to fix it.`
                  : gearOverBudget
                    ? `Equipment over budget (${gearCost}/${gearBudget}). Remove a piece to fix it.`
                    : `Pick ${TEAM_SIZE - team.length} more. ${COST_HINT}.`)}
          </p>
          <label className="opponent-pick">
            <span className="section-label">OPPONENT</span>
            <select value={opponent} onChange={(e) => setOpponent(e.target.value as OpponentKind)}>
              {OPPONENTS.map((o) => (
                <option key={o.kind} value={o.kind}>
                  {o.label}
                </option>
              ))}
            </select>
            <span className="muted small">{OPPONENTS.find((o) => o.kind === opponent)?.blurb}</span>
          </label>
          <div className="row">
            <button className="btn btn-primary battle-btn" disabled={!legal} onClick={battle}>
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
              <p className="small muted">
                {shelf.where === 'account' ? 'Saved to your Account, on every device you sign in on.' : 'Saved in this browser. Sign in on the title screen to keep them on your Account.'}
              </p>
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
                    {savedTeamProblem(t, grants) && (
                      <span className="badge status-badge">{savedTeamProblem(t, grants)!.toUpperCase()}</span>
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
      )}

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
              Showing {shown.length} of {available.length}
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
