import { DEFAULT_OPPONENT, OPPONENTS, type OpponentKind } from '../ai/opponents'

/** The opponent picked in the Team Builder; remembered per browser (a convenience, so storage may fail). */
const KEY = 'scp-battler:opponent:v1'

export function readOpponentKind(): OpponentKind {
  try {
    const v = localStorage.getItem(KEY)
    return OPPONENTS.some((o) => o.kind === v) ? (v as OpponentKind) : DEFAULT_OPPONENT
  } catch {
    return DEFAULT_OPPONENT
  }
}

export function writeOpponentKind(kind: OpponentKind) {
  try {
    localStorage.setItem(KEY, kind)
  } catch {
    // Storage blocked: it just won't be remembered.
  }
}
