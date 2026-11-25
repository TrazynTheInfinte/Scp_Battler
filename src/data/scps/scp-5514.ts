import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-5514',
  name: 'SCP-5514',
  objectClass: 'Thaumiel',
  wave: 9,
  types: ['Mechanical', 'Kinetic'],
  stats: { template: 'armoredStriker' },
  moves: ['cold-iron-sword', 'ram', 'ambush', 'roll-out'],
  signatureMove: phys('cold-iron-sword', 'Cold-Iron Sword', 'Mechanical', 95, 100),
  ability: 'kaijuArmor',
  eligibility: "A 100 m mecha with a gravity railgun and a cold-iron sword, built to kill kaiju.",
  dossier: {
    nickname: "The Dragonslayer",
    authors: "chiifu, Ellie3, J Dune and stormbreath",
    images: [],
  },
} satisfies ScpDefinition
