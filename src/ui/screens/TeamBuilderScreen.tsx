import { useMemo, useState } from 'react'
import { randomTeam } from '../../ai'
import { OBJECT_CLASS_COST, TEAM_BUDGET, TEAM_SIZE, createRng, teamCost, validateTeam } from '../../engine'
import { ROSTER, ROSTER_ORDER } from '../../data/roster'
import { DossierCard, TypeChartButton } from '../components'
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
    <main className="screen">
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
                : `Pick ${TEAM_SIZE - team.length} more. Safe ${OBJECT_CLASS_COST.Safe} · Euclid ${OBJECT_CLASS_COST.Euclid} · Keter ${OBJECT_CLASS_COST.Keter}.`)}
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

      <div className="stack">
        {ROSTER_ORDER.map((id) => {
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
    </main>
  )
}
