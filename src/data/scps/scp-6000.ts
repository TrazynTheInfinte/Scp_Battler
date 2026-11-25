import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-6000',
  name: 'SCP-6000',
  objectClass: 'Apollyon',
  wave: 8,
  types: ['Thaumic', 'Antimemetic'],
  stats: { template: 'mixedAttacker' },
  moves: ['the-way-opens', 'memory-hole', 'crushing-jaws', 'negative-space'],
  signatureMove: spec('the-way-opens', 'The Way Opens', 'Thaumic', 90, 100),
  ability: 'wanderersLibrary',
  eligibility: "A growing Way to the Wanderer's Library, guarded by a sapient serpent and hostile Librarians.",
  dossier: {
    nickname: "The Serpent, the Moose, and the Wanderer's Library",
    authors: "ROUNDERHOUSE",
    images: [],
  },
} satisfies ScpDefinition
