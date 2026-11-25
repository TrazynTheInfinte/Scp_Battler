import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-179',
  name: 'SCP-179',
  objectClass: 'Thaumiel',
  wave: 7,
  types: ['Reality', 'Thaumic'],
  stats: { template: 'specialBruiser' },
  moves: ['point-of-impact', 'smite', 'blinding-light', 'turn-back-time'],
  signatureMove: spec('point-of-impact', 'Point of Impact', 'Reality', 95, 85),
  ability: 'sisterOfTheSun',
  eligibility: "A vast entity beside the Sun that points, unerringly, at whatever is about to strike the Earth.",
  dossier: {
    nickname: "Sauelsuesor",
    authors: "Dr Reach",
    images: [],
  },
} satisfies ScpDefinition
