import { spec, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-274',
  name: 'SCP-274',
  objectClass: 'Keter',
  wave: 12,
  types: ['Memetic', 'Mechanical'],
  stats: { template: 'slowSpecial' },
  moves: ['living-graffiti', 'acidic-bile', 'gear-grind', 'corrupt-file'],
  moveNames: { 'acidic-bile': 'Gastric Paint', 'gear-grind': 'Collapsing Walls', 'corrupt-file': 'Disturbing Mural' },
  signatureMove: spec('living-graffiti', 'Living Graffiti', 'Memetic', 85, 100, [foe({ def: -1 }, 30)]),
  ability: 'acidWalls',
  eligibility: "Graffiti that spreads over buildings and turns them into living, predatory organisms.",
  dossier: {
    nickname: "Graffito",
    authors: "Fantem",
    images: [],
  },
} satisfies ScpDefinition
