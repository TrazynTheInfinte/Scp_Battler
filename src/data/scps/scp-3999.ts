import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-3999',
  name: 'SCP-3999',
  objectClass: 'Apollyon',
  wave: 2,
  types: ['Reality', 'Memetic'],
  stats: { template: 'support' },
  moves: ['narrative-collapse', 'corrupt-file', 'turn-back-time', 'negative-space'],
  signatureMove: spec('narrative-collapse', 'Narrative Collapse', 'Reality', 80, 90),
  ability: 'centerOfEverything',
  eligibility: 'A story that rewrites reality around whoever it centers on.',
  dossier: {
    nickname: 'The Center of Everything',
    authors: 'LordStonefish',
    mature: true,
    images: [
      { file: 'first.jpg', author: 'LordStonefish', license: 'CC BY-SA 3.0' },
      { file: 'seurat.jpg', author: 'LordStonefish', license: 'CC BY-SA 3.0' },
      { file: 'woods.jpg', author: 'LordStonefish', license: 'CC BY-SA 3.0' },
    ],
  },
} satisfies ScpDefinition
