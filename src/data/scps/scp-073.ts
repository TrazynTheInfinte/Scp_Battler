import { spec, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-073',
  name: 'SCP-073',
  objectClass: 'Euclid',
  wave: 4,
  types: ['Temporal', 'Reality'],
  stats: { template: 'support' },
  moves: ['barren-earth', 'refine', 'coarse', 'calming-ooze'],
  signatureMove: spec('barren-earth', 'Barren Earth', 'Temporal', 75, 100, [foe({ spd: -1 }, 20)]),
  ability: 'markOfCain',
  eligibility: "Any harm done to him is turned back on whoever did it, and the ground he walks on dies.",
  dossier: {
    nickname: "\"Cain\"",
    authors: "Kain Pathos Crow",
    images: [],
  },
} satisfies ScpDefinition
