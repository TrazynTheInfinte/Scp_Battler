import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-9319',
  name: 'SCP-9319',
  objectClass: 'Apollyon',
  wave: 8,
  types: ['Antimemetic', 'Memetic'],
  stats: { template: 'fastPhysical' },
  moves: ['feeding-frenzy', 'relentless-pursuit', 'blink', 'ambush'],
  moveNames: { 'relentless-pursuit': 'Thoughtform Hunt', blink: 'Basement Lunge', ambush: 'We Are Here' },
  signatureMove: phys('feeding-frenzy', 'Feeding Frenzy', 'Antimemetic', 85, 100, [inflict('Bleeding', 20)]),
  ability: 'undeletable',
  eligibility: "Thoughtforms that survive deletion, including fast, sharp-toothed humanoids feeding in a basement.",
  dossier: {
    nickname: "We Are Real",
    authors: "popsioak",
    images: [],
  },
} satisfies ScpDefinition
