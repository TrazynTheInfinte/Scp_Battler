import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-077',
  name: 'SCP-077',
  objectClass: 'Euclid',
  wave: 4,
  types: ['Temporal', 'Thaumic'],
  stats: { template: 'slowSpecial' },
  moves: ['green-vapor', 'blood-ink', 'refine', 'coarse'],
  signatureMove: spec('green-vapor', 'Green Vapor', 'Temporal', 75, 100, [inflict('Bleeding', 30)]),
  ability: 'miasma',
  eligibility: "A rune-carved skull that, when neglected, releases a gas rotting all organic matter in its sight.",
  dossier: {
    nickname: "Rot Skull",
    authors: "Gabriel Jade, rewritten by Voct",
    images: [],
  },
} satisfies ScpDefinition
