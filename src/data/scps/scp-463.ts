import { phys, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-463',
  name: 'SCP-463',
  objectClass: 'Safe',
  wave: 16,
  types: ['Reality', 'Thaumic'],
  stats: { template: 'mixedAttacker' },
  moves: ['bend', 'flurry', 'unmake', 'refine'],
  moveNames: { flurry: 'Bend Again', unmake: 'Fold in Half', refine: 'Twist' },
  signatureMove: phys('bend', 'Bend', 'Reality', 80, 100, [foe({ def: -1 }, 30)]),
  ability: 'silverSpoon',
  eligibility: "A silver spoon that, in human hands, bends whoever it is pointed at instead of itself.",
  dossier: {
    nickname: "A Spoon That Bends People",
    authors: "Lancashire McGee",
    images: [],
  },
} satisfies ScpDefinition
