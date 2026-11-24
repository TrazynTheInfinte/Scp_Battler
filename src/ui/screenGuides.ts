/**
 * What each part of a screen does (playtester request: "a simple guide to the UI").
 * Shown by the ? button on that screen, and in How to Play under "Screens".
 */
export type ScreenGuide = { title: string; parts: readonly (readonly [part: string, what: string])[] }

export const TEAM_BUILDER_GUIDE: ScreenGuide = {
  title: 'Team Builder',
  parts: [
    ['Slots', 'Your team. Click a filled slot to remove that SCP.'],
    ['Equipment dropdown', 'Under each filled slot: pick a piece for that SCP. Greyed-out pieces are taken, too expensive, or would do nothing.'],
    ['Budget bar', 'Points spent on SCPs. Each costs its object class.'],
    ['Equipment bar', 'Points spent on Equipment, out of what you have left.'],
    ['Yellow line', 'What the team still needs, or why something was refused.'],
    ['Battle', 'Lights up once the team is complete and legal.'],
    ['Equipment button', 'Lists every piece and what it does.'],
    ['Saved', 'Name and save the current team, or load one you saved.'],
    ['Hide / Show', 'Shrinks the team panel to one line so the list has more room.'],
    ['Search and Filters', 'Narrow the list by number, name, type or object class.'],
    ['SCP list', 'Click an SCP to open its dossier: stats, moves and Ability. Add puts it on your team.'],
    ['Random', 'Fills a random legal team, Equipment included.'],
  ],
}

export const BATTLE_GUIDE: ScreenGuide = {
  title: 'Battle',
  parts: [
    ['Top card', "The opponent's active SCP: object class, types, status, Equipment and HP."],
    ['Bottom card', 'Your active SCP.'],
    ['Dots', '● SCPs still standing on that side, ○ Neutralized.'],
    ['Log', 'What just happened. Click it while a turn plays to skip ahead.'],
    ['Move buttons', 'Type, power, accuracy and PP left. ▲ means super effective against the foe, ▼ resisted. Hold one to read what it does.'],
    ['Switch', 'Swap your active for a benched SCP. Switching uses your turn.'],
    ['Forfeit', 'Concede the battle.'],
    ['Type Chart', 'Which types beat which.'],
  ],
}

export const SCREEN_GUIDES = [TEAM_BUILDER_GUIDE, BATTLE_GUIDE] as const
