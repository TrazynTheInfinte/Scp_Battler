import { useEffect, useState, type ReactNode } from 'react'
import { ROSTER } from '../../data/roster'
import { validateTeam, type BattleState } from '../../engine'
import type { Seat } from '../../online/lockstep'
import {
  createRoom,
  deleteRoom,
  finishRoom,
  forgetRoom,
  joinRoom,
  recordOutcome,
  rememberedRoom,
  submitLead,
  watchRoom,
  type CurrentRoom,
} from '../../online/room'
import { illegalSeats, matchSetup, parseRoomCode, type RoomData } from '../../online/roomData'
import { OnlineDriver } from '../onlineDriver'
import type { SavedTeam } from '../savedTeams'
import { BattleScreen } from './BattleScreen'
import { ResultScreen } from './ResultScreen'
import { TeamPreviewScreen } from './TeamPreviewScreen'

/** How long a disconnected opponent has to come back before they lose. */
export const GRACE_MS = 2 * 60 * 1000

const other = (seat: Seat): Seat => (seat === 0 ? 1 : 0)

/**
 * Online play: pick a Saved Team, create or join a Room, then Team Preview,
 * the battle, and the result, all driven by the Room's data. A reload lands
 * back here and rejoins the remembered Room.
 */
export function OnlineScreen({
  uid,
  callsign,
  teams,
  onExit,
}: {
  uid: string
  callsign: string
  teams: SavedTeam[]
  onExit: () => void
}) {
  const [current, setCurrent] = useState<CurrentRoom | null>(rememberedRoom)
  // undefined: still loading.
  const [room, setRoom] = useState<RoomData | null | undefined>(undefined)
  const [driver, setDriver] = useState<OnlineDriver | null>(null)
  const [result, setResult] = useState<BattleState | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [awayDeadline, setAwayDeadline] = useState<number | null>(null)

  const leave = (note: string | null = null) => {
    forgetRoom()
    setCurrent(null)
    setRoom(undefined)
    setDriver(null)
    setResult(null)
    setAwayDeadline(null)
    setMessage(note)
  }

  useEffect(() => {
    if (!current) return
    setRoom(undefined)
    return watchRoom(current.code, current.seat, setRoom)
  }, [current])

  // React to each Room change.
  useEffect(() => {
    if (!current || room === undefined || result) return
    if (room === null || room.seats[current.seat]?.uid !== uid) {
      leave(driver ? null : 'That Room has closed.')
      return
    }
    const illegal = illegalSeats(room, ROSTER).length > 0
    if (illegal && !room.log.outcome) void recordOutcome(current.code, { kind: 'noContest' })
    if (driver) driver.update(room)
    else if (matchSetup(room) && !illegal) {
      setDriver(new OnlineDriver(current.code, current.seat, room))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs per Room change
  }, [room])

  // The opponent's presence: start the grace period when they drop, clear it if they return.
  const opponent = current && room ? room.seats[other(current.seat)] : null
  const opponentAway = opponent !== null && !opponent.online && !room?.log.outcome && !result
  useEffect(() => {
    setAwayDeadline((d) => (opponentAway ? (d ?? Date.now() + GRACE_MS) : null))
  }, [opponentAway])
  useEffect(() => driver?.setAway(awayDeadline), [driver, awayDeadline])
  useEffect(() => {
    if (awayDeadline === null || !current) return
    const t = window.setTimeout(() => {
      void recordOutcome(current.code, {
        kind: 'abandoned',
        seat: other(current.seat),
        atStep: driver?.applied ?? 0,
      })
    }, Math.max(0, awayDeadline - Date.now()))
    return () => window.clearTimeout(t)
  }, [awayDeadline, current, driver])

  if (!current) return <Lobby uid={uid} callsign={callsign} teams={teams} message={message} onEnter={setCurrent} onExit={onExit} />

  const { code, seat } = current

  if (result) {
    return (
      <ResultScreen
        final={result}
        opponent={opponent?.callsign}
        builderLabel="Back to Play Online"
        onBuilder={() => leave()}
        onTitle={() => {
          leave()
          onExit()
        }}
      />
    )
  }

  if (driver) {
    return (
      <BattleScreen
        key={code}
        driver={driver}
        onFinished={(final) => {
          setResult(final)
          void finishRoom(code, seat, room ?? null)
        }}
        onExit={() => {
          void finishRoom(code, seat, room ?? null)
          leave()
        }}
      />
    )
  }

  if (!room) return <Waiting title="CONNECTING" text="Connecting to the Room…" />

  const mine = room.seats[seat]!
  const away = awayDeadline !== null && <AwayNote name={opponent?.callsign ?? 'Your opponent'} deadline={awayDeadline} />

  // Ended before the first turn: someone left, or a team wasn't legal.
  if (room.log.outcome) {
    const text =
      room.log.outcome.kind === 'noContest'
        ? "The Room closed: a team isn't legal on this version of the game."
        : `${opponent?.callsign ?? 'Your opponent'} left the Room.`
    return (
      <Waiting title="ROOM CLOSED" text={text}>
        <button
          className="btn btn-primary"
          onClick={() => {
            void finishRoom(code, seat, room)
            leave()
          }}
        >
          OK
        </button>
      </Waiting>
    )
  }

  const quit = () => {
    if (!opponent) {
      void deleteRoom(code)
      return leave()
    }
    void recordOutcome(code, { kind: 'forfeit', seat, atStep: 0 }).then(() => finishRoom(code, seat, room))
    leave()
  }

  if (!opponent) {
    return (
      <Waiting title="ROOM CODE" text="Send this code to a friend. They choose Play Online, then Join.">
        <p className="room-code" aria-label={`Room code ${code.split('').join(' ')}`}>
          {code}
        </p>
        <p className="small muted">Waiting for someone to join…</p>
        <button className="btn" onClick={quit}>
          Cancel
        </button>
      </Waiting>
    )
  }

  if (mine.lead === null) {
    return (
      <>
        <TeamPreviewScreen
          playerTeam={mine.team}
          playerEquipment={mine.equipment}
          aiTeam={opponent.team}
          aiEquipment={opponent.equipment}
          opponentLabel={opponent.callsign.toUpperCase()}
          backLabel="Leave"
          onBack={quit}
          onBegin={(lead) => void submitLead(code, seat, lead)}
        />
        {away}
      </>
    )
  }

  return (
    <Waiting title="TEAM PREVIEW" text={`Waiting for ${opponent.callsign} to choose a lead…`}>
      {away}
      <button className="btn" onClick={quit}>
        Leave Room
      </button>
    </Waiting>
  )
}

function Waiting({ title, text, children }: { title: string; text: string; children?: ReactNode }) {
  return (
    <main className="screen">
      <div className="screen-head">
        <h2>{title}</h2>
      </div>
      <div className="stack online-wait">
        <p>{text}</p>
        {children}
      </div>
    </main>
  )
}

function AwayNote({ name, deadline }: { name: string; deadline: number }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [])
  const left = Math.max(0, Math.ceil((deadline - now) / 1000))
  return (
    <p className="notice small" role="status">
      {name} lost connection. The Room closes in {Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')} unless
      they return.
    </p>
  )
}

function Lobby({
  uid,
  callsign,
  teams,
  message,
  onEnter,
  onExit,
}: {
  uid: string
  callsign: string
  teams: SavedTeam[]
  message: string | null
  onEnter: (room: CurrentRoom) => void
  onExit: () => void
}) {
  const legal = teams.filter((t) => validateTeam(ROSTER, t.speciesIds, t.equipment).length === 0)
  const [picked, setPicked] = useState<string | null>(legal.length === 1 ? legal[0].name : null)
  const [codeInput, setCodeInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(message)
  const team = legal.find((t) => t.name === picked) ?? null
  const entrant = team && { uid, callsign, team: team.speciesIds, equipment: team.equipment ?? [] }

  const create = async () => {
    if (!entrant) return
    setBusy(true)
    setError(null)
    const r = await createRoom(entrant)
    setBusy(false)
    if (r.ok) onEnter({ code: r.code, seat: 0 })
    else setError(r.error)
  }
  const join = async () => {
    if (!entrant) return setError('Pick a team first.')
    const code = parseRoomCode(codeInput)
    if (!code) return setError('Room Codes are 6 letters and numbers.')
    setBusy(true)
    setError(null)
    const r = await joinRoom(code, entrant)
    setBusy(false)
    if (r.ok) onEnter({ code, seat: r.seat })
    else setError(r.error)
  }

  return (
    <main className="screen">
      <div className="screen-head">
        <button className="btn btn-small" onClick={onExit}>
          ← Back
        </button>
        <h2>PLAY ONLINE</h2>
        <span />
      </div>
      <p className="small muted">
        Playing as <strong>{callsign}</strong>.
      </p>
      <section className="stack">
        <p className="section-label">YOUR TEAM</p>
        {legal.length === 0 && (
          <p className="small muted">Save a complete, legal team in the Team Builder first, then come back.</p>
        )}
        {legal.map((t) => (
          <button
            key={t.name}
            className={`saved-row team-pick${picked === t.name ? ' selected' : ''}`}
            aria-pressed={picked === t.name}
            onClick={() => setPicked(t.name)}
          >
            <span>
              <strong>{t.name}</strong>
              <span className="muted small" style={{ display: 'block' }}>
                {t.speciesIds.map((id) => ROSTER.species[id].name.replace('SCP-', '')).join(' · ')}
              </span>
            </span>
          </button>
        ))}
      </section>
      <section className="stack">
        <button className="btn btn-primary" disabled={!team || busy} onClick={create}>
          Create Room
        </button>
        <p className="section-label">OR JOIN A FRIEND'S ROOM</p>
        <form
          className="row"
          style={{ flexWrap: 'nowrap' }}
          onSubmit={(e) => {
            e.preventDefault()
            void join()
          }}
        >
          <input
            className="text-input room-code-input"
            value={codeInput}
            placeholder="ROOM CODE"
            aria-label="Room Code"
            autoCapitalize="characters"
            autoComplete="off"
            maxLength={9}
            onChange={(e) => setCodeInput(e.target.value)}
          />
          <button className="btn" type="submit" disabled={!team || busy}>
            Join
          </button>
        </form>
        {error && (
          <p className="notice small" role="alert">
            {error}
          </p>
        )}
      </section>
    </main>
  )
}
