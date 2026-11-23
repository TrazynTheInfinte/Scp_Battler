import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-001',
  name: 'SCP-001',
  objectClass: 'Keter',
  wave: 2,
  types: ['Reality', 'Thaumic'],
  stats: { template: 'physicalBruiser' },
  moves: ['flaming-sword', 'unmake', 'rend', 'erasure'],
  signatureMove: phys('flaming-sword', 'Flaming Sword', 'Thaumic', 100, 90),
  ability: 'guardianOfTheGate',
  eligibility: 'A colossal guardian that destroys anything that approaches or attacks it.',
  dossier: {
    nickname: 'The Gate Guardian',
    authors: 'DrClef',
    wikiUrl: 'https://scp-wiki.wikidot.com/dr-clef-s-proposal',
    images: [
      { file: 'Angel-new-video.webm', author: 'syuzhet', license: 'CC BY-SA 3.0' },
    ],
  },
} satisfies ScpDefinition
