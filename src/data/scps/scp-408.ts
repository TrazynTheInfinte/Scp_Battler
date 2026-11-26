import { spec, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-408',
  name: 'SCP-408',
  objectClass: 'Safe',
  wave: 15,
  types: ['Antimemetic', 'Memetic'],
  stats: { template: 'support' },
  moves: ['threat-display', 'obscure', 'memory-hole', 'calming-ooze'],
  moveNames: { obscure: 'Camouflage', 'memory-hole': 'Vanish Into the Walls', 'calming-ooze': 'Flutter' },
  signatureMove: spec('threat-display', 'Threat Display', 'Memetic', 75, 100, [foe({ atk: -1 }, 30)]),
  ability: 'hiveMimicry',
  eligibility: "A hive-mind mass of butterflies that vanishes into its surroundings or takes the shape of a predator.",
  dossier: {
    nickname: "Illusory Butterflies",
    authors: "Dr Kondraki",
    images: [],
  },
} satisfies ScpDefinition
