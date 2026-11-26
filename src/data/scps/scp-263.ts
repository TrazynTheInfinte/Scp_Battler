import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-263',
  name: 'SCP-263',
  objectClass: 'Safe',
  wave: 12,
  types: ['Mechanical', 'Memetic'],
  stats: { template: 'specialBruiser' },
  moves: ['cash-or-ash', 'data-surge', 'dissonant-chord', 'sedative'],
  moveNames: { 'data-surge': 'Studio Lights', 'dissonant-chord': 'Theme Tune', sedative: 'Commercial Break' },
  signatureMove: spec('cash-or-ash', 'Cash or Ash', 'Memetic', 90, 90, [inflict('Bleeding', 30)]),
  ability: 'finalRound',
  eligibility: "A 1960s TV game show whose host pays winners in cash and burns losers to ash.",
  dossier: {
    nickname: "\"Cash or Ash\"",
    authors: "judgedeadd and Devereaux",
    images: [],
  },
} satisfies ScpDefinition
