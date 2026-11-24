import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-5050-ex',
  name: 'SCP-5050-EX',
  objectClass: 'Euclid',
  wave: 6,
  types: ['Mundane'],
  stats: { template: 'mixedAttacker' },
  moves: ['saw-trick', 'flare', 'pepper-spray', 'brace'],
  signatureMove: phys('saw-trick', 'Saw Trick', 'Mundane', 90, 95),
  ability: 'escapeArtist',
  eligibility: "A stage magician whose saw tricks, bullet catches, and escapes stopped being tricks.",
  dossier: {
    nickname: "Presto!",
    authors: "weizhong and CityToast",
    images: [],
  },
} satisfies ScpDefinition
