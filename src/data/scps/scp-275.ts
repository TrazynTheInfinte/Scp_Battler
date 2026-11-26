import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-275',
  name: 'SCP-275',
  objectClass: 'Safe',
  wave: 12,
  types: ['Kinetic', 'Temporal'],
  stats: { template: 'wall' },
  moves: ['iron-fist', 'rend', 'corrosive-touch', 'coarse'],
  moveNames: { rend: 'Heavy Hand', 'corrosive-touch': 'Weight of Years', coarse: 'Unbreakable' },
  signatureMove: phys('iron-fist', 'Iron Fist', 'Kinetic', 80, 100),
  ability: 'ironskin',
  eligibility: "A 168-year-old woman who can't be harmed by any means the Foundation has.",
  dossier: {
    nickname: "Ironskin",
    authors: "Kain Pathos Crow and Voct",
    images: [],
  },
} satisfies ScpDefinition
