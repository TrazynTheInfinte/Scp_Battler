import { phys, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-421',
  name: 'SCP-421',
  objectClass: 'Euclid',
  wave: 15,
  types: ['Kinetic', 'Mechanical'],
  stats: { template: 'physicalBruiser' },
  moves: ['driftwood-shoal', 'ambush', 'ram', 'tickle'],
  moveNames: { ambush: 'Circling Shoal', ram: 'Log Ram', tickle: 'Splinter Nip' },
  signatureMove: phys('driftwood-shoal', 'Driftwood Shoal', 'Kinetic', 80, 100, [foe({ def: -1 }, 30)]),
  ability: 'endlessShoal',
  eligibility: "A predator built from driftwood and ocean waste, circled by a shoal of wooden fish it makes and reabsorbs.",
  dossier: {
    nickname: "Shoal of Driftwood",
    authors: "Sirava",
    images: [],
  },
} satisfies ScpDefinition
