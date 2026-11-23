import { useState } from 'react'
import { ROSTER } from '../../data/roster'
import { ClassBadge, ContainmentCard, EquipmentTag, TypeBadge, TypeChartButton } from '../components'

function TeamGrid({
  team,
  equipment,
  selected,
  onSelect,
}: {
  team: readonly string[]
  equipment: readonly (string | null)[]
  selected?: number
  onSelect?: (i: number) => void
}) {
  return (
    <div className="preview-grid">
      {team.map((id, i) => {
        const sp = ROSTER.species[id]
        const content = (
          <>
            <ContainmentCard speciesId={id} />
            <strong className="small">{sp.name}</strong>
            <ClassBadge objectClass={sp.objectClass} />
            <div className="row" style={{ gap: 3, justifyContent: 'center' }}>
              {sp.types.map((t) => (
                <TypeBadge key={t} type={t} />
              ))}
            </div>
            <EquipmentTag id={equipment[i] ?? null} />
          </>
        )
        return onSelect ? (
          <button
            key={id}
            className={`preview-card${selected === i ? ' selected' : ''}`}
            onClick={() => onSelect(i)}
            aria-pressed={selected === i}
          >
            {content}
          </button>
        ) : (
          <div key={id} className="preview-card">
            {content}
          </div>
        )
      })}
    </div>
  )
}

export function TeamPreviewScreen({
  playerTeam,
  playerEquipment,
  aiTeam,
  aiEquipment,
  onBegin,
  onBack,
}: {
  playerTeam: readonly string[]
  playerEquipment: readonly (string | null)[]
  aiTeam: readonly string[]
  aiEquipment: readonly (string | null)[]
  onBegin: (lead: number) => void
  onBack: () => void
}) {
  const [lead, setLead] = useState<number | null>(null)
  return (
    <main className="screen">
      <div className="screen-head">
        <button className="btn btn-small" onClick={onBack}>
          ← Back
        </button>
        <h2>TEAM PREVIEW</h2>
        <TypeChartButton />
      </div>
      <section className="stack">
        <p className="section-label">HOSTILE SITE</p>
        <TeamGrid team={aiTeam} equipment={aiEquipment} />
      </section>
      <section className="stack">
        <p className="section-label">YOUR TEAM — CHOOSE WHO DEPLOYS FIRST</p>
        <TeamGrid team={playerTeam} equipment={playerEquipment} selected={lead ?? undefined} onSelect={setLead} />
      </section>
      <button className="btn btn-primary" disabled={lead === null} onClick={() => lead !== null && onBegin(lead)}>
        {lead === null ? 'Choose a lead' : `Deploy ${ROSTER.species[playerTeam[lead]].name}`}
      </button>
    </main>
  )
}
