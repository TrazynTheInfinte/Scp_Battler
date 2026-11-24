import { useState, useSyncExternalStore } from 'react'
import { chooseAction, chooseReplacement, randomEquipment, randomTeam } from './ai'
import { ROSTER, ROSTER_ORDER } from './data/roster'
import { createRng, type BattleState } from './engine'
import { accountStore } from './online/account'
import './ui/ui.css'
import {
  playerMustReplace,
  playerReplace,
  playerTurn,
  startSession,
  type Session,
} from './ui/battleController'
import { BattleScreen } from './ui/screens/BattleScreen'
import { CreditsScreen } from './ui/screens/CreditsScreen'
import { ResultScreen } from './ui/screens/ResultScreen'
import { TeamBuilderScreen } from './ui/screens/TeamBuilderScreen'
import { TeamPreviewScreen } from './ui/screens/TeamPreviewScreen'
import { TitleScreen } from './ui/screens/TitleScreen'
import { useTeamShelf } from './ui/teamShelf'

type Screen = 'title' | 'builder' | 'credits' | 'preview' | 'battle' | 'result'

/** A fresh battle seed; battles only need to differ, not be secret. */
const newSeed = () => (Date.now() ^ (Math.random() * 0x100000000)) >>> 0

interface Match {
  aiTeam: string[]
  aiEquipment: (string | null)[]
  seed: number
}

function newMatch(): Match {
  const seed = newSeed()
  const rng = createRng(seed ^ 0xa1)
  const aiTeam = randomTeam(ROSTER, rng, ROSTER_ORDER)
  return { aiTeam, aiEquipment: randomEquipment(ROSTER, rng, aiTeam), seed }
}

/**
 * Dev-only deep links for screenshot checks, e.g.
 * ?screen=battle&team=scp-173,scp-999,scp-914,scp-131&ai=scp-682,...
 * `import.meta.env.DEV` is false in production builds, so this is stripped there.
 */
function devStart(): {
  screen: Screen
  team: string[]
  match: Match | null
  session: Session | null
  result: BattleState | null
} {
  const none = { screen: 'title' as Screen, team: [], match: null, session: null, result: null }
  if (!import.meta.env.DEV) return none
  const q = new URLSearchParams(window.location.search)
  const screen = (q.get('screen') as Screen | null) ?? 'title'
  const team = q.get('team')?.split(',').filter(Boolean) ?? []
  const ai = q.get('ai')?.split(',').filter(Boolean)
  const match = ai ? { aiTeam: ai, aiEquipment: [], seed: 1 } : team.length > 0 ? { ...newMatch(), seed: 1 } : null
  let session =
    (screen === 'battle' || screen === 'result') && match
      ? startSession(ROSTER, team, match.aiTeam, 0, match.seed, [[], match.aiEquipment]).session
      : null
  // ?turns=N auto-plays N turns with the AI on both sides, to show a battle in progress.
  const devRng = createRng(7)
  for (let i = Number(q.get('turns') ?? 0); session && i > 0 && session.state.phase !== 'ended'; i--) {
    session = playerMustReplace(session.state)
      ? playerReplace(session, chooseReplacement(session.state, ROSTER, 0, devRng)).session
      : playerTurn(session, chooseAction(session.state, ROSTER, 0, devRng)).session
  }
  // ?screen=result plays the whole battle out (needs a large ?turns=, e.g. 200).
  const result = screen === 'result' && session?.state.phase === 'ended' ? session.state : null
  return { screen, team, match, session, result }
}

export default function App() {
  const [dev] = useState(devStart)
  const [screen, setScreen] = useState<Screen>(dev.screen)
  // Kept here so the team survives going back to the title and returning.
  const [team, setTeam] = useState<string[]>(dev.team)
  // Aligned with `team`: each SCP's Equipment id, or null.
  const [equipment, setEquipment] = useState<(string | null)[]>([])
  const [match, setMatch] = useState<Match | null>(dev.match)
  const [session, setSession] = useState<Session | null>(dev.session)
  const [result, setResult] = useState<BattleState | null>(dev.result)
  const account = useSyncExternalStore(accountStore.subscribe, accountStore.getSnapshot)
  const shelf = useTeamShelf(account)

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
      return <TitleScreen account={account} onPlay={() => go('builder')} onCredits={() => go('credits')} />
    case 'credits':
      return <CreditsScreen onBack={() => go('title')} />
    case 'builder':
      return (
        <TeamBuilderScreen
          team={team}
          setTeam={setTeam}
          equipment={equipment}
          setEquipment={setEquipment}
          shelf={shelf}
          onBack={() => go('title')}
          onBattle={() => toPreview(newMatch())}
        />
      )
    case 'preview':
      if (!match) return null
      return (
        <TeamPreviewScreen
          playerTeam={team}
          playerEquipment={equipment}
          aiTeam={match.aiTeam}
          aiEquipment={match.aiEquipment}
          onBack={() => go('builder')}
          onBegin={(lead) => {
            setSession(startSession(ROSTER, team, match.aiTeam, lead, match.seed, [equipment, match.aiEquipment]).session)
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
          onFinished={(final) => {
            setResult(final)
            go('result')
          }}
        />
      )
    case 'result':
      if (!result || !match) return null
      return (
        <ResultScreen
          final={result}
          // Same opposing team, new seed, choose leads again.
          onRematch={() => toPreview({ ...match, seed: newSeed() })}
          onBuilder={() => go('builder')}
          onTitle={() => go('title')}
        />
      )
  }
}
