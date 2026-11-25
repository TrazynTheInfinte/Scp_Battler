import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-093',
  name: 'SCP-093',
  objectClass: 'Euclid',
  wave: 5,
  types: ['Kinetic', 'Reality'],
  stats: { template: 'fastPhysical' },
  moves: ['mirror-charge', 'ram', 'roll-out', 'overclock'],
  moveNames: { ram: 'Parting Wave', 'roll-out': 'Disc Spin', overclock: 'Gate Through' },
  signatureMove: phys('mirror-charge', 'Mirror Charge', 'Reality', 85, 100),
  ability: 'momentum',
  eligibility: "A stone disc that, when free, rolls at high speed toward mirrors and punches through whatever is in the way.",
  dossier: {
    nickname: "Red Sea Object",
    authors: "Unknown Author, rewritten by NekoChris",
    images: [],
  },
} satisfies ScpDefinition
