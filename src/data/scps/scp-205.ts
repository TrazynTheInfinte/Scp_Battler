import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-205',
  name: 'SCP-205',
  objectClass: 'Euclid',
  wave: 7,
  types: ['Antimemetic', 'Reality'],
  stats: { template: 'fastSpecial' },
  moves: ['shadow-play', 'obscure', 'refine', 'erasure'],
  moveNames: { refine: 'Shadow Puppet', erasure: 'Lights Out' },
  signatureMove: spec('shadow-play', 'Shadow Play', 'Antimemetic', 90, 100),
  ability: 'castShadows',
  eligibility: "Flood lamps whose shadows play out a scene of their own, and whose unseen figures attack anyone left in the dark.",
  dossier: {
    nickname: "Shadow Lamps",
    authors: "Sorts",
    images: [],
  },
} satisfies ScpDefinition
