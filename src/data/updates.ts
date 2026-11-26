/**
 * Updates (see GLOSSARY.md): the player-facing changelog, newest first.
 * Returning players see each new entry once, in a popup on the title screen
 * (src/ui/updateNotice.ts). Add an entry with any release players would
 * notice, such as a wave or a new feature; ids must be unique and never reused.
 */
export interface Update {
  id: string
  /** YYYY-MM-DD. */
  date: string
  title: string
  added?: readonly string[]
  changed?: readonly string[]
  removed?: readonly string[]
}

export const UPDATES: readonly Update[] = [
  {
    id: '2026-11-26-waves-10-12',
    date: '2026-11-26',
    title: 'Waves 10–12 and new opponents',
    added: [
      '24 new SCPs: wave 10 (097, 102, 134, 146, 166, 169, 191, 219, 233, 234, 236, 239) and wave 12 (244, 247, 250, 252, 255, 262, 263, 265, 266, 273, 274, 275).',
      'Pick your single-player opponent in the Team Builder: Scientist, Trainer, Mobile Task Force, O5 Council Member or Reality Bender.',
      "This What's New popup.",
    ],
    changed: ['SCP-8395: Attack down, Special Defense up.'],
  },
]
