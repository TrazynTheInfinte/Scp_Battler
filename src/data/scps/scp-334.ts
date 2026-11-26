import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-334',
  name: 'SCP-334',
  objectClass: 'Euclid',
  wave: 14,
  types: ['Thaumic', 'Reality'],
  stats: { template: 'fastSpecial' },
  moves: ['plasma-pounce', 'refine', 'blinding-light', 'obscure'],
  moveNames: { refine: 'Heat Shimmer', 'blinding-light': 'Flare Up', obscure: 'Steam Veil' },
  signatureMove: spec('plasma-pounce', 'Plasma Pounce', 'Thaumic', 80, 100, [inflict('Bleeding', 30)]),
  ability: 'superheated',
  eligibility: "A fox of superheated plasma that believes it is an ordinary red fox, and hunts like one.",
  dossier: {
    nickname: "Stellar Vulpine",
    authors: "kendrakirai",
    images: [],
  },
} satisfies ScpDefinition
