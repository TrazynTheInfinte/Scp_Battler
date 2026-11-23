import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-042',
  name: 'SCP-042',
  objectClass: 'Safe',
  wave: 3,
  types: ['Kinetic', 'Memetic'],
  stats: { template: 'physicalBruiser' },
  moves: ['hoof-strike', 'contagious-joy', 'weep', 'flank'],
  signatureMove: phys('hoof-strike', 'Hoof Strike', 'Kinetic', 80, 100),
  ability: 'euphoricTouch',
  eligibility: "A 700 kg horse whose kicks have killed guards, and whose touch brings euphoria, then catatonia.",
  dossier: {
    nickname: 'A Formerly Winged Horse',
    authors: 'Unknown Author and Skali Sharpnose',
    images: [],
  },
} satisfies ScpDefinition
