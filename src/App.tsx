import { useState, useSyncExternalStore } from 'react'
import { chooseAction, chooseReplacement, randomEquipment, randomTeam } from './ai'
import {
  DEFAULT_OPPONENT,
  counterTeam,
  makeOpponent,
  strongEquipment,
  strongTeam,
  type Opponent,
  type OpponentKind,
} from './ai/opponents'
import { ROSTER, ROSTER_ORDER } from './data/roster'
import { WIN_RATES } from './data/winRates'
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
import { aiDriver, type BattleDriver } from './ui/battleDriver'
import { rememberedRoom } from './online/room'
import { OnlineScreen } from './ui/screens/OnlineScreen'
import { BattleScreen } from './ui/screens/BattleScreen'
import { CreditsScreen } from './ui/screens/CreditsScreen'
import { HowToPlayScreen } from './ui/screens/HowToPlayScreen'
import { dismissHowToPrompt } from './ui/howToPrompt'
import { ResultScreen } from './ui/screens/ResultScreen'
import { TeamBuilderScreen } from './ui/screens/TeamBuilderScreen'
import { TeamPreviewScreen } from './ui/screens/TeamPreviewScreen'
import { TitleScreen } from './ui/screens/TitleScreen'
import { useTeamShelf } from './ui/teamShelf'
import {
  TUTORIAL_LEAD,
  TUTORIAL_LEAD_HINT,
  TUTORIAL_OPPONENT_TEAM,
  TUTORIAL_PLAYER_TEAM,
  tutorialDriver,
} from './ui/tutorial'

/** No Gift SCPs (signed out). One shared array, so the Team Builder's list doesn't rebuild each render. */
const NO_GRANTS: readonly string[] = []

type Screen = 'title' | 'builder' | 'credits' | 'howto' | 'preview' | 'battle' | 'result' | 'online'

/** A fresh battle seed; battles only need to differ, not be secret. */
const newSeed = () => (Date.now() ^ (Math.random() * 0x100000000)) >>> 0

interface Match {
  /** The Tutorial Battle (fixed teams, guided first turns; see src/ui/tutorial.ts). */
  tutorial?: boolean
  aiTeam: string[]
  aiEquipment: (string | null)[]
  seed: number
  /** Who the player faces (absent for the tutorial). */
  opponent?: Opponent
}

function newMatch(
  kind: OpponentKind = DEFAULT_OPPONENT,
  playerTeam: readonly string[] = [],
  playerEquipment: readonly (string | null)[] = [],
): Match {
  const seed = newSeed()
  const rng = createRng(seed ^ 0xa1)
  const opponent = makeOpponent(kind, rng)
  // The O5 brings the statistically strongest builds, the Engineer a team built
  // against the player's; everyone else a random legal team.
  const aiTeam =
    kind === 'o5'
      ? strongTeam(ROSTER, rng, ROSTER_ORDER, WIN_RATES)
      : kind === 'engineer' && playerTeam.length > 0
        ? counterTeam(ROSTER, rng, ROSTER_ORDER, WIN_RATES, playerTeam, playerEquipment)
        : randomTeam(ROSTER, rng, ROSTER_ORDER)
  const aiEquipment =
    kind === 'o5' || kind === 'engineer'
      ? strongEquipment(ROSTER, rng, aiTeam, WIN_RATES)
      : randomEquipment(ROSTER, rng, aiTeam)
  return { aiTeam, aiEquipment, seed, opponent }
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
  // A reload during an online match goes straight back to it (the Online screen rejoins).
  const none = {
    screen: (rememberedRoom() && accountStore.getSnapshot().status === 'signedIn' ? 'online' : 'title') as Screen,
    team: [],
    match: null,
    session: null,
    result: null,
  }
  if (!import.meta.env.DEV) return none
  const q = new URLSearchParams(window.location.search)
  const screen = (q.get('screen') as Screen | null) ?? 'title'
  const team = q.get('team')?.split(',').filter(Boolean) ?? []
  const ai = q.get('ai')?.split(',').filter(Boolean)
  // ?opp=engineer (any OpponentKind) names the opponent, so its Voice Lines play.
  const opp = q.get('opp') as OpponentKind | null
  const devOpponent = opp ? makeOpponent(opp, createRng(1)) : undefined
  const match = ai ? { aiTeam: ai, aiEquipment: [], seed: 1, opponent: devOpponent } : team.length > 0 ? { ...newMatch(), seed: 1 } : null
  let session =
    (screen === 'battle' || screen === 'result') && match
      ? startSession(ROSTER, team, match.aiTeam, 0, match.seed, [[], match.aiEquipment], match.opponent).session
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
  const [driver, setDriver] = useState<BattleDriver | null>(() => dev.session && aiDriver(dev.session))
  const [result, setResult] = useState<BattleState | null>(dev.result)
  const account = useSyncExternalStore(accountStore.subscribe, accountStore.getSnapshot)
  const shelf = useTeamShelf(account)
  const grants = account.status === 'signedIn' ? account.grants : NO_GRANTS

  const go = (next: Screen) => {
    setScreen(next)
    window.scrollTo(0, 0)
  }
  const toPreview = (m: Match) => {
    setMatch(m)
    go('preview')
  }
  const startTutorial = () => {
    dismissHowToPrompt()
    // The seed here only keys the screens; the tutorial battle uses its own fixed seed.
    toPreview({ tutorial: true, aiTeam: [...TUTORIAL_OPPONENT_TEAM], aiEquipment: [], seed: newSeed() })
  }
  const title = (
    <TitleScreen
      account={account}
      onPlay={() => go('builder')}
      onPlayOnline={() => go('online')}
      onTutorial={startTutorial}
      onHowToPlay={() => {
        dismissHowToPrompt()
        go('howto')
      }}
      onCredits={() => go('credits')}
    />
  )

  switch (screen) {
    case 'title':
      return title
    case 'online':
      // Needs an Account with a Callsign; signing out mid-match lands on the title.
      if (account.status !== 'signedIn' || !account.callsign) return title
      return (
        <OnlineScreen
          uid={account.uid}
          callsign={account.callsign}
          teams={shelf.teams}
          grants={account.grants}
          onExit={() => go('title')}
        />
      )
    case 'credits':
      return <CreditsScreen onBack={() => go('title')} />
    case 'howto':
      return <HowToPlayScreen onBack={() => go('title')} onTutorial={startTutorial} />
    case 'builder':
      return (
        <TeamBuilderScreen
          team={team}
          setTeam={setTeam}
          equipment={equipment}
          setEquipment={setEquipment}
          shelf={shelf}
          grants={grants}
          onBack={() => go('title')}
          onBattle={(kind) => toPreview(newMatch(kind, team, equipment))}
        />
      )
    case 'preview':
      if (!match) return null
      if (match.tutorial) {
        return (
          <TeamPreviewScreen
            playerTeam={TUTORIAL_PLAYER_TEAM}
            playerEquipment={[]}
            aiTeam={match.aiTeam}
            aiEquipment={[]}
            guide={{ text: TUTORIAL_LEAD_HINT, lead: TUTORIAL_LEAD }}
            onBack={() => go('title')}
            onBegin={(lead) => {
              setDriver(tutorialDriver(lead))
              go('battle')
            }}
          />
        )
      }
      return (
        <TeamPreviewScreen
          playerTeam={team}
          playerEquipment={equipment}
          aiTeam={match.aiTeam}
          aiEquipment={match.aiEquipment}
          opponentLabel={match.opponent?.name.toUpperCase()}
          onBack={() => go('builder')}
          onBegin={(lead) => {
            setDriver(
              aiDriver(
                startSession(ROSTER, team, match.aiTeam, lead, match.seed, [equipment, match.aiEquipment], match.opponent)
                  .session,
              ),
            )
            go('battle')
          }}
        />
      )
    case 'battle':
      if (!driver || !match) return null
      return (
        <BattleScreen
          key={match.seed}
          driver={driver}
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
          opponent={match.opponent?.name}
          // Same opposing team, new seed, choose leads again (the tutorial just starts over).
          onRematch={() => (match.tutorial ? startTutorial() : toPreview({ ...match, seed: newSeed() }))}
          onBuilder={() => go('builder')}
          onTitle={() => go('title')}
        />
      )
  }
}
