import { phys, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-054',
  name: 'SCP-054',
  objectClass: 'Safe',
  wave: 3,
  types: ['Thaumic'],
  stats: { template: 'fastPhysical' },
  moves: ['undertow', 'smite', 'tickle', 'calming-ooze'],
  signatureMove: phys('undertow', 'Undertow', 'Thaumic', 70, 100, [foe({ spe: -1 }, 30)]),
  ability: 'formless',
  eligibility: "A humanoid of living water that has attacked and injured staff, and dissolves into any body of water.",
  dossier: {
    nickname: 'Water Nymph',
    authors: 'Unknown Author and SimpleCadence',
    images: [],
  },
} satisfies ScpDefinition
