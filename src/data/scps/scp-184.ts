import { spec, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-184',
  name: 'SCP-184',
  objectClass: 'Euclid',
  wave: 7,
  types: ['Reality'],
  stats: { template: 'wall' },
  moves: ['shifting-halls', 'blinding-light', 'refine', 'coarse'],
  signatureMove: spec('shifting-halls', 'Shifting Halls', 'Reality', 80, 100, [foe({ acc: -1 }, 30)]),
  ability: 'endlessHalls',
  eligibility: "A small dodecahedron that expands any building around it into a warped, shifting maze.",
  dossier: {
    nickname: "The Architect",
    authors: "Dr Gears",
    images: [],
  },
} satisfies ScpDefinition
