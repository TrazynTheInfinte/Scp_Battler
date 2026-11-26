import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-387',
  name: 'SCP-387',
  objectClass: 'Safe',
  wave: 15,
  types: ['Mechanical', 'Memetic'],
  stats: { template: 'mixedAttacker' },
  moves: ['brick-construct', 'refine', 'roll-out', 'coarse'],
  moveNames: { refine: 'Snap Together', 'roll-out': 'Rolling Bricks', coarse: 'Rebuild' },
  signatureMove: phys('brick-construct', 'Brick Construct', 'Mechanical', 80, 100),
  ability: 'reinforce',
  eligibility: "A tub of self-replicating Lego that builds whatever it decides it needs.",
  dossier: {
    nickname: "Living Lego",
    authors: "EmancipatedEmptiness",
    images: [],
  },
} satisfies ScpDefinition
