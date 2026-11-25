import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-202',
  name: 'SCP-202',
  objectClass: 'Safe',
  wave: 7,
  types: ['Temporal'],
  stats: { template: 'balanced' },
  moves: ['reverse-blow', 'decay', 'flank', 'coarse'],
  signatureMove: phys('reverse-blow', 'Reverse Blow', 'Temporal', 80, 100),
  ability: 'backwards',
  eligibility: "A man who lives every action in reverse; whatever is done to him runs the other way.",
  dossier: {
    nickname: "The Rewind Man",
    authors: "FritzWillie",
    images: [],
  },
} satisfies ScpDefinition
