import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-516',
  name: 'SCP-516',
  objectClass: 'Safe',
  wave: 17,
  types: ['Mechanical', 'Kinetic'],
  stats: { template: 'armoredStriker' },
  moves: ['main-gun', 'quick-strike', 'ram', 'roll-out'],
  moveNames: { 'quick-strike': 'Coaxial Gun', ram: 'Tread Over', 'roll-out': 'Traverse Turret' },
  signatureMove: { ...phys('main-gun', 'Main Gun', 'Mechanical', 130, 100), charge: true },
  ability: 'reactiveArmor',
  eligibility: "A T-55 tank with a mind of its own and an anomalous main gun.",
  dossier: {
    nickname: "Intelligent Tank",
    authors: "ModernMajorGeneral",
    images: [],
  },
} satisfies ScpDefinition
