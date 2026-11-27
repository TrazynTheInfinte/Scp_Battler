import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-499',
  name: 'SCP-499',
  objectClass: 'Euclid',
  wave: 17,
  types: ['Thaumic', 'Reality'],
  stats: { template: 'slowSpecial' },
  moves: ['dying-sun', 'overcharge', 'refine', 'blinding-light'],
  moveNames: { overcharge: 'High Noon', refine: 'Heat Shimmer', 'blinding-light': 'Sunburst' },
  signatureMove: spec('dying-sun', 'Dying Sun', 'Thaumic', 90, 100, [inflict('Burning', 30)]),
  ability: 'eyesOfTheSun',
  eligibility: "A blind, burned old man who carries a sun inside him.",
  dossier: {
    nickname: "Old Sun Man",
    authors: "Djoric",
    images: [],
  },
} satisfies ScpDefinition
