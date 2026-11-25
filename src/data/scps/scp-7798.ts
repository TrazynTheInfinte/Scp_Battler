import { spec, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-7798',
  name: 'SCP-7798',
  objectClass: 'Apollyon',
  wave: 8,
  types: ['Antimemetic', 'Kinetic'],
  stats: { template: 'fastSpecial' },
  moves: ['information-siphon', 'dissonant-chord', 'negative-space', 'obscure'],
  moveNames: { 'dissonant-chord': 'Gravity Pulse', 'negative-space': 'Blank Record', obscure: 'Meteor Shower' },
  signatureMove: spec('information-siphon', 'Information Siphon', 'Antimemetic', 85, 100, [foe({ spa: -1 }, 30)]),
  ability: 'erasedFromRecord',
  eligibility: "A faster-than-light celestial being that feeds on erased text and memory, and finally on Earth.",
  dossier: {
    nickname: "Meteor Belt, Barren Of Life, Of No Importance",
    authors: "jaboi",
    images: [],
  },
} satisfies ScpDefinition
