import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-128',
  name: 'SCP-128',
  objectClass: 'Euclid',
  wave: 5,
  types: ['Kinetic', 'Antimemetic'],
  stats: { template: 'fastSpecial' },
  moves: ['momentum-barrage', 'negative-space', 'memory-hole', 'overclock'],
  moveNames: { 'negative-space': 'Energy Sink', 'memory-hole': 'Invisible Impact', overclock: 'Build Speed' },
  signatureMove: spec('momentum-barrage', 'Momentum Barrage', 'Kinetic', 90, 90),
  ability: 'holeForMomentum',
  eligibility: "An unseen source of momentum that hurls loose objects in its sight at deadly speeds.",
  dossier: {
    nickname: "Kinetic Energy Entity",
    authors: "HK-016, rewritten by WrongJohnSilver",
    images: [],
  },
} satisfies ScpDefinition
