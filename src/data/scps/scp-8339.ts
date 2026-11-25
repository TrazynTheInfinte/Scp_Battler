import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-8339',
  name: 'SCP-8339',
  objectClass: 'Apollyon',
  wave: 8,
  types: ['Kinetic', 'Reality'],
  stats: { template: 'fastPhysical' },
  moves: ['lightbreak-touch', 'unmake', 'ambush', 'blinding-light'],
  moveNames: { unmake: 'Into the Light', ambush: 'Sudden Arrival', 'blinding-light': 'Searing Glow' },
  signatureMove: phys('lightbreak-touch', 'Lightbreak Touch', 'Kinetic', 90, 100),
  ability: 'lightHunters',
  eligibility: "The Luminaries: impossibly fast hunters that sense any light through walls and burst whatever they touch into light.",
  dossier: {
    nickname: "Photophobia: Live in the Dark. Die in the Light.",
    authors: "Ecronak and AnAnomalousWriter",
    mature: true,
    images: [],
  },
} satisfies ScpDefinition
