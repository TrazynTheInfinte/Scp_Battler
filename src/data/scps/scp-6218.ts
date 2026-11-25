import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-6218',
  name: 'SCP-6218',
  objectClass: 'Apollyon',
  wave: 8,
  types: ['Reality', 'Antimemetic'],
  stats: { template: 'wall' },
  moves: ['hallucinogenic-surface', 'refine', 'memory-hole', 'obscure'],
  signatureMove: spec('hallucinogenic-surface', 'Hallucinogenic Surface', 'Antimemetic', 80, 100, [inflict('Amnesiac', 30)]),
  ability: 'shellOfTheUniverse',
  eligibility: "A sphere that holds the whole universe, whose hallucinogenic surface hosts creatures of its own.",
  dossier: {
    nickname: "The Ceiling of the Universe.",
    authors: "September2000",
    images: [],
  },
} satisfies ScpDefinition
