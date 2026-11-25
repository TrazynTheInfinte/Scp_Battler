import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-009',
  name: 'SCP-009',
  objectClass: 'Euclid',
  wave: 3,
  types: ['Temporal', 'Reality'],
  stats: { template: 'balanced' },
  moves: ['frozen-veins', 'refine', 'sedative', 'decay'],
  moveNames: { refine: 'Crimson Shard', sedative: 'Hypothermia', decay: 'Slow Freeze' },
  signatureMove: spec('frozen-veins', 'Frozen Veins', 'Temporal', 75, 100, [inflict('Bleeding', 30)]),
  ability: 'spreadingFreeze',
  eligibility: "Converts the water inside a body into spreading red ice, which ruptures it from within.",
  dossier: {
    nickname: 'Red Ice',
    authors: 'Chameleon X',
    images: [],
  },
} satisfies ScpDefinition
