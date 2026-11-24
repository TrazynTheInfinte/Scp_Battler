import { useState } from 'react'
import { CALLSIGN_MAX } from '../../online/accountData'
import {
  dismissAccountNotice,
  setCallsign,
  signIn,
  signOut,
  type AccountState,
} from '../../online/account'

export function TitleScreen({
  account,
  onPlay,
  onPlayOnline,
  onCredits,
}: {
  account: AccountState
  onPlay: () => void
  onPlayOnline: () => void
  onCredits: () => void
}) {
  const canPlayOnline = account.status === 'signedIn' && account.callsign !== null
  return (
    <main className="screen">
      <div className="title-hero">
        <p className="eyebrow">SECURE · CONTAIN · PROTECT</p>
        <h1>SCP Battler</h1>
        <p className="muted">
          Assemble a containment team of six anomalies within your clearance budget, then
          neutralize the opposing site's SCPs.
        </p>
        <div className="title-actions">
          <button className="btn btn-primary" onClick={onPlay}>
            New Battle
          </button>
          <button className="btn" disabled={!canPlayOnline} onClick={onPlayOnline}>
            Play Online
          </button>
          {!canPlayOnline && (
            <p className="small muted" style={{ margin: 0 }}>
              {account.status === 'signedIn' ? 'Choose a Callsign below to play online.' : 'Sign in below to play online with friends.'}
            </p>
          )}
          <button className="btn" onClick={onCredits}>
            Credits
          </button>
        </div>
        <AccountPanel account={account} />
      </div>
      <p className="muted small">
        Based on the SCP Foundation (scp-wiki.wikidot.com), CC BY-SA 3.0. Not affiliated with the SCP Wiki.
      </p>
    </main>
  )
}

/** Sign in / out, and the Callsign form on first sign-in (or when changing it). */
function AccountPanel({ account }: { account: AccountState }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)

  const run = async (action: () => Promise<string | null | void>) => {
    setBusy(true)
    setError(null)
    try {
      const message = await action()
      if (message) setError(message)
      return !message
    } finally {
      setBusy(false)
    }
  }

  const notice = account.notice && (
    <p className="notice small" role="status">
      {account.notice}{' '}
      <button className="btn-link" onClick={dismissAccountNotice}>
        dismiss
      </button>
    </p>
  )
  const errorLine = error && (
    <p className="notice small" role="alert">
      {error}
    </p>
  )

  if (account.status === 'signedOut') {
    return (
      <div className="account-panel stack">
        <button className="btn" disabled={busy} onClick={() => run(signIn)}>
          {busy ? 'Signing in…' : 'Sign in with Google'}
        </button>
        <p className="small muted">Keeps your Saved Teams on every device you sign in on. Not needed for New Battle.</p>
        {errorLine}
        {notice}
      </div>
    )
  }

  const needsCallsign = account.loaded && account.callsign === null
  if (needsCallsign || editing) {
    return (
      <div className="account-panel stack">
        <CallsignForm
          initial={account.callsign ?? account.suggestedCallsign}
          busy={busy}
          first={needsCallsign}
          onSave={async (value) => {
            if (await run(() => setCallsign(value))) setEditing(false)
          }}
          onCancel={needsCallsign ? undefined : () => setEditing(false)}
        />
        {errorLine}
        {notice}
      </div>
    )
  }

  return (
    <div className="account-panel stack">
      <p className="small">
        Signed in as <strong>{account.callsign ?? '…'}</strong>
        {!account.online && account.loaded && <span className="muted"> · offline</span>}
      </p>
      <div className="row">
        <button className="btn btn-small" disabled={busy || !account.loaded} onClick={() => setEditing(true)}>
          Change Callsign
        </button>
        <button className="btn btn-small" disabled={busy} onClick={() => run(signOut)}>
          Sign out
        </button>
      </div>
      {errorLine}
      {notice}
    </div>
  )
}

function CallsignForm({
  initial,
  busy,
  first,
  onSave,
  onCancel,
}: {
  initial: string
  busy: boolean
  first: boolean
  onSave: (value: string) => void
  onCancel?: () => void
}) {
  const [value, setValue] = useState(initial)
  return (
    <form
      className="stack"
      onSubmit={(e) => {
        e.preventDefault()
        onSave(value)
      }}
    >
      <label className="small" htmlFor="callsign">
        {first ? 'Choose a Callsign' : 'Your Callsign is'} the name opponents see. They never see your Google name or email.
      </label>
      <div className="row" style={{ flexWrap: 'nowrap' }}>
        <input
          id="callsign"
          className="text-input"
          value={value}
          maxLength={CALLSIGN_MAX}
          autoComplete="off"
          onChange={(e) => setValue(e.target.value)}
        />
        <button className="btn btn-small btn-primary" type="submit" disabled={busy}>
          Save
        </button>
        {onCancel && (
          <button className="btn btn-small" type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
