import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-105',
  name: 'SCP-105',
  objectClass: 'Safe',
  wave: 2,
  types: ['Mechanical', 'Temporal'],
  stats: { template: 'fastSpecial' },
  moves: ['through-the-lens', 'gear-grind', 'refine', 'corrupt-file'],
  signatureMove: spec('through-the-lens', 'Through the Lens', 'Temporal', 75, null),
  ability: 'outOfReach',
  eligibility: 'Reaches through photographs to act on distant places and people.',
  dossier: {
    nickname: 'Iris',
    authors: 'thedeadlymoose, Dantensen, and DrClef',
    images: [
      { file: '2014-07-18 22.41.47-new.jpg', author: 'Retro00064', license: 'CC BY-SA 3.0' },
    ],
    art: '2014-07-18 22.41.47-new.jpg',
  },
} satisfies ScpDefinition
