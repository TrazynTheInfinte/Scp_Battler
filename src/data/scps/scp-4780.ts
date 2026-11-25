import { spec, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-4780',
  name: 'SCP-4780',
  objectClass: 'Apollyon',
  wave: 8,
  types: ['Mechanical', 'Reality'],
  stats: { template: 'balanced' },
  moves: ['shrink-ray', 'data-surge', 'unmake', 'refine'],
  signatureMove: spec('shrink-ray', 'Shrink Ray', 'Mechanical', 70, 100, [foe({ atk: -1, spa: -1 }, 50)]),
  ability: 'reverseSetting',
  eligibility: "A shrink ray, written up by the researcher it shrank, which has a reverse setting.",
  dossier: {
    nickname: "Shrunk",
    authors: "A Random Day",
    images: [],
  },
} satisfies ScpDefinition
