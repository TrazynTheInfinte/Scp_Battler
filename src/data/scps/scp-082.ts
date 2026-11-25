import { phys, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-082',
  name: 'SCP-082',
  objectClass: 'Euclid',
  wave: 4,
  types: ['Biological', 'Kinetic'],
  stats: { template: 'physicalBruiser' },
  moves: ['bone-cracking-bite', 'ram', 'contagious-joy', 'stalk'],
  moveNames: { ram: 'Bull Rush', 'contagious-joy': 'Friendly Greeting', stalk: 'Hunger Pangs' },
  signatureMove: phys('bone-cracking-bite', 'Bone-Cracking Bite', 'Biological', 85, 100, [foe({ def: -1 }, 20)]),
  ability: 'thickHide',
  eligibility: "An amicable giant who attacks without warning, cracks bone with his jaw, and barely notices bullets.",
  dossier: {
    nickname: "\"Fernand\" the Cannibal",
    authors: "FritzWillie",
    images: [],
  },
} satisfies ScpDefinition
