import { spec, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-309',
  name: 'SCP-309',
  objectClass: 'Euclid',
  wave: 13,
  types: ['Thaumic', 'Temporal'],
  stats: { template: 'support' },
  moves: ['inside-out', 'tickle', 'decay', 'calming-ooze'],
  moveNames: { tickle: 'Soft Touch', decay: 'Lingering Ache', 'calming-ooze': 'Cuddle' },
  signatureMove: spec('inside-out', 'Inside Out', 'Thaumic', 80, 100, [foe({ def: -1 }, 30)]),
  ability: 'dontTouch',
  eligibility: "An inside-out plush toy; even brushing it with a finger leaves living things in agony.",
  dossier: {
    nickname: "Plush Toy",
    authors: "Anna Graham",
    images: [],
  },
} satisfies ScpDefinition
