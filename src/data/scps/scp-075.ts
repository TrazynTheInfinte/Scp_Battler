import { phys, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-075',
  name: 'SCP-075',
  objectClass: 'Euclid',
  wave: 4,
  types: ['Biological', 'Temporal'],
  stats: { template: 'physicalBruiser' },
  moves: ['corrosive-drench', 'corrosive-touch', 'ram', 'stalk'],
  signatureMove: phys('corrosive-drench', 'Corrosive Drench', 'Biological', 80, 100, [foe({ def: -1 }, 30)]),
  ability: 'leapingPredator',
  eligibility: "A huge snail that leaps on its prey at speed and drenches it in a corrosive secretion.",
  dossier: {
    nickname: "Corrosive Snail",
    authors: "Unknown Author, rewritten by Aelanna",
    images: [],
  },
} satisfies ScpDefinition
