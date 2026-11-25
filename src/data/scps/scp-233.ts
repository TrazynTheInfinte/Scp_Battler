import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-233',
  name: 'SCP-233',
  objectClass: 'Keter',
  wave: 10,
  types: ['Reality', 'Antimemetic'],
  stats: { template: 'slowSpecial' },
  moves: ['base-twenty-three', 'memory-hole', 'negative-space', 'corrupt-file'],
  moveNames: { 'memory-hole': 'Uncountable', 'negative-space': 'Prime Void', 'corrupt-file': 'Miscount' },
  signatureMove: spec('base-twenty-three', 'Base Twenty-Three', 'Reality', 90, 100),
  ability: 'numerologicalZone',
  eligibility: "A 23-sided shape that bends maths to base 23 and violently destroys things within 23 metres.",
  dossier: {
    nickname: "23-Sided Polyhedron",
    authors: "DrClef",
    images: [],
  },
} satisfies ScpDefinition
