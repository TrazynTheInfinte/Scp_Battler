import { useState } from 'react'
import './ui/ui.css'
import { CreditsScreen } from './ui/screens/CreditsScreen'
import { TeamBuilderScreen } from './ui/screens/TeamBuilderScreen'
import { TitleScreen } from './ui/screens/TitleScreen'

type Screen = 'title' | 'builder' | 'credits' | 'preview'

/**
 * Dev-only deep links for screenshot checks, e.g. ?screen=builder&team=scp-173,scp-999.
 * `import.meta.env.DEV` is false in production builds, so this is stripped there.
 */
function devParams(): { screen?: Screen; team?: string[] } {
  if (!import.meta.env.DEV) return {}
  const q = new URLSearchParams(window.location.search)
  return {
    screen: (q.get('screen') as Screen | null) ?? undefined,
    team: q.get('team')?.split(',').filter(Boolean),
  }
}

export default function App() {
  const [dev] = useState(devParams)
  const [screen, setScreen] = useState<Screen>(dev.screen ?? 'title')
  // Kept here so the team survives going back to the title and returning.
  const [team, setTeam] = useState<string[]>(dev.team ?? [])

  const go = (next: Screen) => {
    setScreen(next)
    window.scrollTo(0, 0)
  }

  switch (screen) {
    case 'title':
      return <TitleScreen onPlay={() => go('builder')} onCredits={() => go('credits')} />
    case 'credits':
      return <CreditsScreen onBack={() => go('title')} />
    case 'builder':
      return (
        <TeamBuilderScreen
          team={team}
          setTeam={setTeam}
          onBack={() => go('title')}
          onBattle={() => go('preview')}
        />
      )
    case 'preview':
      // Team Preview and the Battle screen arrive in the next update.
      return (
        <main className="screen">
          <p className="eyebrow">CLEARANCE PENDING</p>
          <h2>Team Preview</h2>
          <p className="muted">Battles are coming in the next update. Your team is ready.</p>
          <button className="btn" onClick={() => go('builder')}>
            ← Back to Team Builder
          </button>
        </main>
      )
  }
}
