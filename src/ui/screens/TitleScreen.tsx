export function TitleScreen({ onPlay, onCredits }: { onPlay: () => void; onCredits: () => void }) {
  return (
    <main className="screen">
      <div className="title-hero">
        <p className="eyebrow">SECURE · CONTAIN · PROTECT</p>
        <h1>SCP Battler</h1>
        <p className="muted">
          Assemble a containment team of four anomalies within your clearance budget, then
          neutralize the opposing site's SCPs.
        </p>
        <div className="title-actions">
          <button className="btn btn-primary" onClick={onPlay}>
            New Battle
          </button>
          <button className="btn" onClick={onCredits}>
            Credits
          </button>
        </div>
      </div>
      <p className="muted small">
        Based on the SCP Foundation (scp-wiki.wikidot.com), CC BY-SA 3.0. Not affiliated with the SCP Wiki.
      </p>
    </main>
  )
}
