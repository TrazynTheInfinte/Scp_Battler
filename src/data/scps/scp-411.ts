import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-411',
  name: 'SCP-411',
  objectClass: 'Thaumiel',
  wave: 9,
  types: ['Temporal', 'Memetic'],
  stats: { template: 'support' },
  moves: ['foresight', 'dissonant-chord', 'blinding-light', 'erasure'],
  moveNames: { 'dissonant-chord': 'Grim Prophecy', 'blinding-light': 'Fateful Warning', erasure: 'Backwards Memory' },
  signatureMove: spec('foresight', 'Foresight', 'Temporal', 80, null),
  ability: 'remembersTheFuture',
  eligibility: "A man who ages backwards and remembers the future, consulted to see threats coming.",
  dossier: {
    nickname: "Ancient Precog",
    authors: "Foweraker",
    images: [],
  },
} satisfies ScpDefinition
