import { status, heal, cure } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-2295',
  name: 'SCP-2295',
  objectClass: 'Safe',
  wave: 2,
  types: ['Thaumic'],
  stats: { template: 'support' },
  moves: ['stitch-up', 'smite', 'roll-out', 'calming-ooze'],
  moveNames: { smite: 'Patchwork Magic', 'roll-out': 'Playful Tumble', 'calming-ooze': 'Comforting Hug' },
  signatureMove: status('stitch-up', 'Stitch Up', 'Thaumic', null, [heal(33), cure]),
  ability: 'stuffed',
  eligibility: 'A patchwork bear that sews replacement organs into the injured.',
  dossier: {
    nickname: 'The Bear with a Heart of Patchwork',
    authors: 'K Mota',
    images: [
      { file: 'kairos.jpg', author: 'cuddlesandnuggets', license: 'CC BY 3.0' },
    ],
    art: 'kairos.jpg',
  },
} satisfies ScpDefinition
