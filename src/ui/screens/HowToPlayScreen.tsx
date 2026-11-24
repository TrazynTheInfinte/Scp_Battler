import type { ReactNode } from 'react'
import {
  AMNESIAC_MAX_TURNS,
  AMNESIAC_MIN_TURNS,
  AMNESIA_RANDOM_MOVE_CHANCE,
  BLEED_FRACTION,
  CLASS_LIMIT,
  CONTAINED_FRACTION,
  CONTAINED_TURNS,
  EQUIPMENT_ALLOWANCE,
  OBJECT_CLASS_COST,
  SAME_TYPE_BONUS,
  STATUS_IMMUNITIES,
  STUN_SKIP_CHANCE,
  TEAM_BUDGET,
  TEAM_SIZE,
  TURN_LIMIT,
  TYPE_RING,
  matchup,
  type ObjectClass,
} from '../../engine'
import { TypeBadge, TypeChartButton } from '../components'

/**
 * The basics, for new players (playtester request). Every number comes from
 * the engine's own constants, so this page can't drift from the rules.
 */

const fraction = (f: number) => `1/${Math.round(1 / f)}`
const percent = (f: number) => `${Math.round(f * 100)}%`

const CLASSES = (Object.keys(OBJECT_CLASS_COST) as ObjectClass[]).map((c) => `${c} ${OBJECT_CLASS_COST[c]}`).join(' · ')
const LIMITED = (Object.keys(CLASS_LIMIT) as ObjectClass[]).map((c) => `${CLASS_LIMIT[c]} ${c}`).join(' and ')
const IMMUNE = Object.entries(STATUS_IMMUNITIES)
  .map(([type, status]) => `${type} SCPs can't be ${status === 'Bleeding' ? 'made to Bleed' : `made ${status}`}`)
  .join('; ')

/** The two types a ring type is super effective against. */
const beats = (t: (typeof TYPE_RING)[number]) => TYPE_RING.filter((d) => matchup(t, d) === 2)

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="panel stack howto">
      <p className="section-label">{title}</p>
      <ul>{children}</ul>
    </section>
  )
}

export function HowToPlayScreen({ onBack, onTutorial }: { onBack: () => void; onTutorial: () => void }) {
  const example = TYPE_RING[0]
  const [a, b] = beats(example)
  return (
    <main className="screen">
      <div className="screen-head">
        <button className="btn btn-small" onClick={onBack}>
          ← Back
        </button>
        <h2>HOW TO PLAY</h2>
        <TypeChartButton />
      </div>

      <button className="btn btn-primary" onClick={onTutorial}>
        Tutorial Battle
      </button>
      <p className="small muted" style={{ margin: 0 }}>
        A short guided battle that walks you through the basics. Or read on:
      </p>

      <Section title="1 · THE GOAL">
        <li>Each side brings a team of {TEAM_SIZE} SCPs. One at a time is on the field (the active); the rest wait on the bench.</li>
        <li>Neutralize every opposing SCP (bring its HP to 0) before yours are.</li>
        <li>
          If nobody has won after turn {TURN_LIMIT}, the side with the bigger share of its team's HP left wins.
        </li>
      </Section>

      <Section title="2 · BUILDING A TEAM">
        <li>
          Pick {TEAM_SIZE} SCPs in the Team Builder within a budget of {TEAM_BUDGET} points. Each costs its object
          class: {CLASSES}.
        </li>
        <li>At most {LIMITED} per team.</li>
        <li>Tap an SCP in the list to read its dossier: stats, moves, and Ability. Save teams you like for later.</li>
      </Section>

      <Section title="3 · EQUIPMENT">
        <li>Each SCP can carry one piece of Equipment, and each piece can be used once per team.</li>
        <li>
          Equipment is paid from {EQUIPMENT_ALLOWANCE} points set aside just for it, plus whatever your SCPs leave
          of the {TEAM_BUDGET}-point budget.
        </li>
        <li>Healing doesn't stack: a Medkit does nothing on an SCP whose Ability already heals each turn.</li>
      </Section>

      <Section title="4 · TURNS">
        <li>Before the battle, both sides see each other's teams and pick who goes out first.</li>
        <li>Each turn, both sides choose at the same time: use a move, or switch to a benched SCP.</li>
        <li>Switches happen first. Then moves go in order of Speed, fastest first (a few Abilities change that).</li>
        <li>When your active is Neutralized, you choose a replacement from the bench.</li>
      </Section>

      <Section title="5 · MOVES">
        <li>
          <strong>Physical</strong> moves use Attack against Defense; <strong>Special</strong> moves use Sp. Attack
          against Sp. Defense; <strong>Status</strong> moves deal no damage but boost, weaken, heal, or inflict a
          status.
        </li>
        <li>Each move has power, accuracy (some never miss), and PP: how many times it can be used.</li>
        <li>Hold (or long-press) a move in battle to see what it does.</li>
      </Section>

      <Section title="6 · TYPES">
        <li>
          Eight types form a ring. Each is super effective (x2) against two others and resisted (x0.5) by the two that
          beat it. For example, <TypeBadge type={example} /> beats <TypeBadge type={a} /> and <TypeBadge type={b} />.
        </li>
        <li>
          <TypeBadge type="Mundane" /> sits outside the ring: neutral against everything, and everything is neutral
          against it.
        </li>
        <li>A move matching its user's type hits {SAME_TYPE_BONUS}x as hard (Same-Type Bonus).</li>
        <li>The Type Chart button (top right, and in battle) shows the whole ring.</li>
      </Section>

      <Section title="7 · STATUS CONDITIONS">
        <li>
          <strong>Bleeding</strong>: loses {fraction(BLEED_FRACTION)} of its max HP each turn.
        </li>
        <li>
          <strong>Stunned</strong>: half Speed, and a {percent(STUN_SKIP_CHANCE)} chance to lose its turn.
        </li>
        <li>
          <strong>Amnesiac</strong>: for {AMNESIAC_MIN_TURNS}–{AMNESIAC_MAX_TURNS} turns, a{' '}
          {percent(AMNESIA_RANDOM_MOVE_CHANCE)} chance to use a random move instead.
        </li>
        <li>
          <strong>Contained</strong>: can't switch out, and loses {fraction(CONTAINED_FRACTION)} of its max HP each
          turn, for {CONTAINED_TURNS} turns.
        </li>
        <li>An SCP can have only one status at a time. {IMMUNE}.</li>
      </Section>

      <Section title="8 · ABILITIES">
        <li>Every SCP has one passive Ability that bends the rules for it, like healing each turn or hurting attackers.</li>
        <li>It's listed in the SCP's dossier, and the battle log says when it triggers.</li>
      </Section>

      <Section title="9 · PLAYING ONLINE">
        <li>Sign in with Google on the title screen and choose a Callsign: the only name opponents see.</li>
        <li>Choose Play Online, pick a saved team, and Create Room. Send the 6-character Room Code to a friend.</li>
        <li>Your friend chooses Play Online, then joins with that code.</li>
      </Section>

      <button className="btn" onClick={onBack}>
        Got it
      </button>
    </main>
  )
}
