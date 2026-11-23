import { artCredit, DOSSIERS } from '../../data/dossiers'
import { ROSTER, ROSTER_ORDER } from '../../data/roster'

const REPO = 'https://github.com/TrazynTheInfinte/Scp_Battler'

export function CreditsScreen({ onBack }: { onBack: () => void }) {
  return (
    <main className="screen">
      <div className="screen-head">
        <button className="btn btn-small" onClick={onBack}>
          ← Back
        </button>
        <h2>CREDITS</h2>
        <span />
      </div>

      <section className="panel small">
        <p style={{ marginTop: 0 }}>
          SCP Battler is based on the{' '}
          <a href="https://scp-wiki.wikidot.com/" target="_blank" rel="noreferrer">
            SCP Foundation
          </a>
          . SCP names, concepts, and images are licensed under{' '}
          <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noreferrer">
            CC BY-SA 3.0
          </a>
          . Game mechanics, move and ability names, and descriptions are original adaptations,
          released under the same license.
        </p>
        <p style={{ marginBottom: 0 }}>
          Source code: MIT License —{' '}
          <a href={REPO} target="_blank" rel="noreferrer">
            GitHub
          </a>
          . Not affiliated with or endorsed by the SCP Wiki.
        </p>
      </section>

      <section className="panel">
        <p className="section-label">SCP ARTICLES</p>
        {ROSTER_ORDER.map((id) => {
          const d = DOSSIERS[id]
          const art = artCredit(id)
          return (
            <div className="credit" key={id}>
              <strong>{ROSTER.species[id].name}</strong> <span className="muted">{d.nickname}</span>
              <div>
                by {d.authors} —{' '}
                <a href={d.wikiUrl} target="_blank" rel="noreferrer">
                  article
                </a>
                {d.mature && <span className="mature-note"> (mature content)</span>}
              </div>
              {art && (
                <div className="muted">
                  Image: {art.file} by {art.author}, {art.license}
                  {art.note ? `. ${art.note}` : ''}. Resized.
                </div>
              )}
            </div>
          )
        })}
      </section>
    </main>
  )
}
