import { useState } from 'react'
import { ROSTER } from '../../data/roster'
import { ClassBadge, ContainmentCard, EquipmentTag, ScpInfoOverlay, TypeBadge, TypeChartButton } from '../components'
import { redactionFor } from '../scpInfo'

function TeamGrid({
  team,
  equipment,
  selected,
  onSelect,
  only,
  onInspect,
}: {
  team: readonly string[]
  equipment: readonly (string | null)[]
  selected?: number
  onSelect?: (i: number) => void
  /** Tutorial: the one SCP that may be picked. */
  only?: number
  /** Tap a card to see its details (the opponent's team). */
  onInspect?: (i: number) => void
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
            className={`preview-card${selected === i ? ' selected' : ''}${only === i && selected !== i ? ' guided' : ''}`}
            disabled={only !== undefined && only !== i}
            onClick={() => onSelect(i)}
            aria-pressed={selected === i}
          >
            {content}
          </button>
        ) : onInspect ? (
          <button key={id} className="preview-card" onClick={() => onInspect(i)} aria-label={`${sp.name} details`}>
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
  opponentLabel = 'HOSTILE SITE',
  backLabel = '← Back',
  guide,
}: {
  playerTeam: readonly string[]
  playerEquipment: readonly (string | null)[]
  aiTeam: readonly string[]
  aiEquipment: readonly (string | null)[]
  onBegin: (lead: number) => void
  onBack: () => void
  opponentLabel?: string
  backLabel?: string
  /** Tutorial: a hint, and the one lead that may be picked. */
  guide?: { text: string; lead: number }
}) {
  const [lead, setLead] = useState<number | null>(null)
  const [inspect, setInspect] = useState<number | null>(null)
  return (
    <main className="screen">
      <div className="screen-head">
        <button className="btn btn-small" onClick={onBack}>
          {backLabel}
        </button>
        <h2>TEAM PREVIEW</h2>
        <TypeChartButton />
      </div>
      <section className="stack">
        <p className="section-label">{opponentLabel} — TAP AN SCP FOR DETAILS</p>
        <TeamGrid team={aiTeam} equipment={aiEquipment} onInspect={setInspect} />
      </section>
      {inspect !== null && (
        <ScpInfoOverlay
          speciesId={aiTeam[inspect]}
          equipment={aiEquipment[inspect] ?? null}
          redaction={redactionFor(aiTeam[inspect], { own: false })}
          onClose={() => setInspect(null)}
        />
      )}
      <section className="stack">
        <p className="section-label">YOUR TEAM — CHOOSE WHO DEPLOYS FIRST</p>
        {guide && (
          <p className="guide-hint" role="status">
            {guide.text}
          </p>
        )}
        <TeamGrid
          team={playerTeam}
          equipment={playerEquipment}
          selected={lead ?? undefined}
          onSelect={setLead}
          only={guide?.lead}
        />
      </section>
      <button className="btn btn-primary" disabled={lead === null} onClick={() => lead !== null && onBegin(lead)}>
        {lead === null ? 'Choose a lead' : `Deploy ${ROSTER.species[playerTeam[lead]].name}`}
      </button>
    </main>
  )
}
