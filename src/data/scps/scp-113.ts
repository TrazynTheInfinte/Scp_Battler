import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-113',
  name: 'SCP-113',
  objectClass: 'Safe',
  wave: 5,
  types: ['Reality', 'Biological'],
  stats: { template: 'slowSpecial' },
  moves: ['jasper-burn', 'acidic-bile', 'coarse', 'calming-ooze'],
  moveNames: { 'acidic-bile': 'Searing Stone', coarse: 'Jasper Shell', 'calming-ooze': 'Numbing Glow' },
  signatureMove: spec('jasper-burn', 'Jasper Burn', 'Reality', 85, 100, [inflict('Bleeding', 30)]),
  ability: 'searingTouch',
  eligibility: "A stone whose touch violently rewrites the body of whoever holds it, burning and sometimes killing them.",
  dossier: {
    nickname: "The Gender-Switcher",
    authors: "kabu, rewritten by Robin Sure and thedeadlymoose",
    images: [],
  },
} satisfies ScpDefinition
