import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-6820',
  name: 'SCP-6820',
  objectClass: 'Thaumiel',
  wave: 9,
  types: ['Memetic', 'Mechanical'],
  stats: { template: 'specialBruiser' },
  moves: ['memeplex-erasure', 'gear-grind', 'corrupt-file', 'negative-space'],
  signatureMove: spec('memeplex-erasure', 'Memeplex Erasure', 'Memetic', 95, 100),
  ability: 'adaptiveDefenses',
  eligibility: "A colossal, adaptive eigenweapon built to erase an idea-based predator.",
  dossier: {
    nickname: "TERMINATION ATTEMPT",
    authors: "Liryn, Placeholder McD and syuzhet",
    images: [],
  },
} satisfies ScpDefinition
