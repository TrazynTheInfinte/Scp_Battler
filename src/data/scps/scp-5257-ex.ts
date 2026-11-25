import { spec, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-5257-ex',
  name: 'SCP-5257-EX',
  objectClass: 'Safe',
  wave: 6,
  types: ['Mundane'],
  stats: { template: 'support' },
  moves: ['malfunction', 'flare', 'pepper-spray', 'brace'],
  moveNames: { flare: 'Static Shock', 'pepper-spray': 'Short Circuit', brace: 'Unplug' },
  signatureMove: spec('malfunction', 'Malfunction', 'Mundane', 75, 100, [foe({ spa: -1 }, 30)]),
  ability: 'badLuck',
  eligibility: "A technician convinced technology hates him, around whom machines keep breaking, and hurting people.",
  dossier: {
    nickname: "Technology HATES Local Man for discovering this ONE WEIRD TRICK (CLICK NOW)",
    authors: "Prismal & Harmacy",
    images: [],
  },
} satisfies ScpDefinition
