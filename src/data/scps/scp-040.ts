import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-040',
  name: 'SCP-040',
  objectClass: 'Euclid',
  wave: 3,
  types: ['Reality', 'Temporal'],
  stats: { template: 'support' },
  moves: ['loyal-creation', 'regenerate', 'calming-ooze', 'refine'],
  signatureMove: phys('loyal-creation', 'Loyal Creation', 'Reality', 85, 100),
  ability: 'loyalCreations',
  eligibility: "Reshapes living things into loyal creatures, which fight and shield her on her behalf.",
  dossier: {
    nickname: "Evolution's Child",
    authors: 'Kain Pathos Crow and Djoric',
    images: [],
  },
} satisfies ScpDefinition
