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
    id: '2026-11-26-wave-15',
    date: '2026-11-26',
    title: 'Wave 15',
    added: ['12 new SCPs: 387, 390, 399, 403, 408, 409, 421, 422, 424, 428, 435 and 439.'],
  },
  {
    id: '2026-11-26-wave-14',
    date: '2026-11-26',
    title: 'Wave 14',
    added: ['12 new SCPs: 323, 326, 334, 337, 339, 346, 352, 353, 355, 359, 363 and 371.'],
  },
  {
    id: '2026-11-26-wave-13',
    date: '2026-11-26',
    title: 'Wave 13',
    added: ['12 new SCPs: 278, 280, 285, 293, 295, 299, 303, 305, 307, 309, 312 and 314.'],
    changed: ['SCP-8274: Special Attack down, Special Defense up.'],
  },
  {
    id: '2026-11-26-scp-details',
    date: '2026-11-26',
    title: 'Scout the opposition',
    added: [
      "Tap an opponent's SCP in Team Preview to see its stats, ability and moves.",
      "In battle, tap ⓘ next to either active SCP, or beside your SCPs when switching, to see the same plus its current stat changes.",
    ],
  },
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
