import { phys, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-8395',
  name: 'SCP-8395',
  objectClass: 'Apollyon',
  wave: 8,
  types: ['Mechanical', 'Kinetic'],
  stats: { template: 'physicalBruiser' },
  moves: ['gravity-well', 'roll-out', 'corrosive-touch', 'flank'],
  signatureMove: phys('gravity-well', 'Gravity Well', 'Kinetic', 90, 90, [foe({ spe: -1 }, 30)]),
  ability: 'armorPlating',
  eligibility: "A colossal armored biomechanical being with its own gravity, unharmed by nukes and energy weapons.",
  dossier: {
    nickname: "A Very Dapper Gentleman",
    authors: "CN Productions",
    images: [],
  },
} satisfies ScpDefinition
