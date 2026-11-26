import { phys, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-371',
  name: 'SCP-371',
  objectClass: 'Euclid',
  wave: 14,
  types: ['Biological', 'Temporal'],
  stats: { template: 'fastPhysical' },
  moves: ['injecting-beak', 'crushing-jaws', 'corrosive-touch', 'tickle'],
  moveNames: { 'crushing-jaws': 'Beak Crush', 'corrosive-touch': 'Genetic Rewrite', tickle: 'Tail-Fibre Grab' },
  signatureMove: phys('injecting-beak', 'Injecting Beak', 'Biological', 80, 100, [foe({ def: -1 }, 30)]),
  ability: 'hijackedCells',
  eligibility: "A jellyfish-sized marine virus that walks the sea floor and injects its prey through a hardened beak.",
  dossier: {
    nickname: "Macrovirus",
    authors: "Sophia Light",
    images: [],
  },
} satisfies ScpDefinition
