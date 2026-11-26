import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-457',
  name: 'SCP-457',
  objectClass: 'Euclid',
  wave: 16,
  types: ['Thaumic', 'Kinetic'],
  stats: { template: 'fastSpecial' },
  moves: ['living-flame', 'smite', 'refine', 'blinding-light'],
  moveNames: { smite: 'Flare Up', refine: 'Heat Haze', 'blinding-light': 'Blinding Blaze' },
  signatureMove: spec('living-flame', 'Living Flame', 'Thaumic', 85, 100, [inflict('Burning', 30)]),
  ability: 'spreadingBlaze',
  eligibility: "A living fire with a mind, that grows into a human shape as it finds fuel and hunts for more.",
  dossier: {
    nickname: "Burning Man",
    authors: "agatharights",
    images: [],
  },
} satisfies ScpDefinition
