import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-469',
  name: 'SCP-469',
  objectClass: 'Keter',
  wave: 16,
  types: ['Reality', 'Memetic'],
  stats: { template: 'physicalBruiser' },
  moves: ['wing-storm', 'colossal-blow', 'ambush', 'rend'],
  moveNames: { 'colossal-blow': 'Descend', ambush: 'Enfold', rend: 'Feather Edge' },
  signatureMove: { ...phys('wing-storm', 'Wing Storm', 'Reality', 30, 100), hits: [2, 5] as const },
  ability: 'thousandWings',
  eligibility: "A nine-metre ball of white wings that unfurls to take its prey.",
  dossier: {
    nickname: "Many-Winged Angel",
    authors: "ProfSnider",
    images: [],
  },
} satisfies ScpDefinition
