import { useState } from 'react'
import { chooseAction, randomTeam } from './ai'
import { ROSTER, ROSTER_ORDER } from './data/roster'
import { createRng } from './engine'
import './ui/ui.css'
import { playerTurn, startSession, type Session } from './ui/battleController'
import { BattleScreen } from './ui/screens/BattleScreen'
import { CreditsScreen } from './ui/screens/CreditsScreen'
import { TeamBuilderScreen } from './ui/screens/TeamBuilderScreen'
import { TeamPreviewScreen } from './ui/screens/TeamPreviewScreen'
import { TitleScreen } from './ui/screens/TitleScreen'

type Screen = 'title' | 'builder' | 'credits' | 'preview' | 'battle'

/** A fresh battle seed; battles only need to differ, not be secret. */
const newSeed = () => (Date.now() ^ (Math.random() * 0x100000000)) >>> 0

interface Match {
  aiTeam: string[]
  seed: number
}

function newMatch(): Match {
  const seed = newSeed()
  return { aiTeam: randomTeam(ROSTER, createRng(seed ^ 0xa1), ROSTER_ORDER), seed }
}

/**
 * Dev-only deep links for screenshot checks, e.g.
 * ?screen=battle&team=scp-173,scp-999,scp-914,scp-131&ai=scp-682,...
 * `import.meta.env.DEV` is false in production builds, so this is stripped there.
 */
function devStart(): { screen: Screen; team: string[]; match: Match | null; session: Session | null } {
  const none = { screen: 'title' as Screen, team: [], match: null, session: null }
  if (!import.meta.env.DEV) return none
  const q = new URLSearchParams(window.location.search)
  const screen = (q.get('screen') as Screen | null) ?? 'title'
  const team = q.get('team')?.split(',').filter(Boolean) ?? []
  const ai = q.get('ai')?.split(',').filter(Boolean)
  const match = ai ? { aiTeam: ai, seed: 1 } : team.length === 4 ? { ...newMatch(), seed: 1 } : null
  let session =
    screen === 'battle' && match ? startSession(ROSTER, team, match.aiTeam, 0, match.seed).session : null
  // ?turns=N auto-plays N turns with the AI on both sides, to show a battle in progress.
  const devRng = createRng(7)
  for (let i = Number(q.get('turns') ?? 0); session && i > 0 && session.state.phase === 'choose'; i--) {
    session = playerTurn(session, chooseAction(session.state, ROSTER, 0, devRng)).session
  }
  return { screen, team, match, session }
}

export default function App() {
  const [dev] = useState(devStart)
  const [screen, setScreen] = useState<Screen>(dev.screen)
  // Kept here so the team survives going back to the title and returning.
  const [team, setTeam] = useState<string[]>(dev.team)
  const [match, setMatch] = useState<Match | null>(dev.match)
  const [session, setSession] = useState<Session | null>(dev.session)

  const go = (next: Screen) => {
    setScreen(next)
    window.scrollTo(0, 0)
  }
  const toPreview = (m: Match) => {
    setMatch(m)
    go('preview')
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
          onBattle={() => toPreview(newMatch())}
        />
      )
    case 'preview':
      if (!match) return null
      return (
        <TeamPreviewScreen
          playerTeam={team}
          aiTeam={match.aiTeam}
          onBack={() => go('builder')}
          onBegin={(lead) => {
            setSession(startSession(ROSTER, team, match.aiTeam, lead, match.seed).session)
            go('battle')
          }}
        />
      )
    case 'battle':
      if (!session || !match) return null
      return (
        <BattleScreen
          key={match.seed}
          initial={session}
          // Same opposing team, new seed, choose leads again.
          onRematch={() => toPreview({ aiTeam: match.aiTeam, seed: newSeed() })}
          onExit={() => go('builder')}
        />
      )
  }
}
