import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-403',
  name: 'SCP-403',
  objectClass: 'Safe',
  wave: 15,
  types: ['Thaumic', 'Kinetic'],
  stats: { template: 'fastSpecial' },
  moves: ['escalating-flame', 'smite', 'refine', 'blinding-light'],
  moveNames: { smite: 'Fireball', refine: 'Flare Burst', 'blinding-light': 'Spark' },
  signatureMove: spec('escalating-flame', 'Escalating Flame', 'Thaumic', 75, 100, [inflict('Bleeding', 30)]),
  ability: 'escalation',
  eligibility: "A lighter whose flame grows more violent each time it is struck, up to explosions.",
  dossier: {
    nickname: "Escalating Lighter",
    authors: "LitigousReport",
    images: [],
  },
} satisfies ScpDefinition
