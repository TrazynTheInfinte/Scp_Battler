import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-4004',
  name: 'SCP-4004',
  objectClass: 'Thaumiel',
  wave: 9,
  types: ['Reality', 'Kinetic'],
  stats: { template: 'specialBruiser' },
  moves: ['conceptual-severance', 'dissonant-chord', 'rend', 'blinding-light'],
  signatureMove: spec('conceptual-severance', 'Conceptual Severance', 'Reality', 90, 100),
  ability: 'preemptiveStrike',
  eligibility: "A national reality engine whose Mount Rushmore strikes down threats with fissures, disease and severance.",
  dossier: {
    nickname: "A Dream Come True",
    authors: "Akumeoy and kinchtheknifeblade",
    images: [],
  },
} satisfies ScpDefinition
