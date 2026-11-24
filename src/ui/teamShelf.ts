import { useMemo, useState } from 'react'
import { ROSTER } from '../data/roster'
import { saveAccountTeams, type AccountState } from '../online/account'
import {
  browserStorage,
  loadTeams,
  removeTeam,
  upsertTeam,
  writeTeams,
  type SaveResult,
  type SavedTeam,
} from './savedTeams'

/** The Saved Teams the builder shows: the Account's while signed in, else this browser's. */
export interface TeamShelf {
  teams: SavedTeam[]
  /** Where they live, for the panel's caption. */
  where: 'account' | 'browser'
  save(name: string, speciesIds: readonly string[], equipment: readonly (string | null)[]): Promise<SaveResult>
  remove(name: string): Promise<SaveResult>
}

export function useTeamShelf(account: AccountState): TeamShelf {
  const storage = useMemo(() => browserStorage(), [])
  // Re-read when the account changes: signing in moves teams out of the browser, signing out reveals what's left.
  const [local, setLocal] = useState<{ status: string; teams: SavedTeam[] }>(() => ({
    status: account.status,
    teams: loadTeams(storage, ROSTER),
  }))
  const localTeams = local.status === account.status ? local.teams : loadTeams(storage, ROSTER)
  if (local.status !== account.status) setLocal({ status: account.status, teams: localTeams })

  if (account.status === 'signedIn') {
    const teams = account.teams
    const commit = async (next: SavedTeam[]): Promise<SaveResult> => {
      const result = await saveAccountTeams(next)
      return result === 'ok' ? { ok: true, teams: next } : { ok: false, reason: result === 'offline' ? 'offline' : 'storage' }
    }
    return {
      teams,
      where: 'account',
      save: async (name, ids, eq) => {
        const edit = upsertTeam(teams, ROSTER, name, ids, eq)
        return edit.ok ? commit(edit.teams) : edit
      },
      remove: (name) => commit(removeTeam(teams, name)),
    }
  }
  const commit = (next: SavedTeam[]): SaveResult => {
    const result = writeTeams(storage, next)
    if (result.ok) setLocal({ status: account.status, teams: next })
    return result
  }
  return {
    teams: localTeams,
    where: 'browser',
    save: async (name, ids, eq) => {
      const edit = upsertTeam(localTeams, ROSTER, name, ids, eq)
      return edit.ok ? commit(edit.teams) : edit
    },
    remove: async (name) => commit(removeTeam(localTeams, name)),
  }
}
