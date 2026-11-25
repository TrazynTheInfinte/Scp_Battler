import { spec, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-9509',
  name: 'SCP-9509',
  objectClass: 'Apollyon',
  wave: 8,
  types: ['Biological', 'Temporal'],
  stats: { template: 'support' },
  moves: ['energy-drain', 'acidic-bile', 'sedative', 'corrosive-touch'],
  signatureMove: spec('energy-drain', 'Energy Drain', 'Temporal', 80, 100, [foe({ spe: -1 }, 50)]),
  ability: 'perpetualMotion',
  eligibility: "A heatproof bacterium that never stops, found in Antarctic ice that drains the energy from anything.",
  dossier: {
    nickname: "A Perpetual Motion Microbe",
    authors: "LordBabel",
    images: [],
  },
} satisfies ScpDefinition
