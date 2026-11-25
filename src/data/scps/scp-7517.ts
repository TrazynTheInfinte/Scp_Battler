import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-7517',
  name: 'SCP-7517',
  objectClass: 'Thaumiel',
  wave: 9,
  types: ['Reality', 'Mechanical'],
  stats: { template: 'wall' },
  moves: ['anchor-field', 'data-surge', 'refine', 'blinding-light'],
  signatureMove: spec('anchor-field', 'Anchor Field', 'Reality', 80, 100),
  ability: 'scrantonField',
  eligibility: "The MK-VII Scranton Reality Anchor, which cancels reality-bending for 300 m around it.",
  dossier: {
    nickname: "It's a good site!",
    authors: "Letova",
    images: [],
  },
} satisfies ScpDefinition
