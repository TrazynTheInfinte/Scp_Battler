import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-101',
  name: 'SCP-101',
  objectClass: 'Euclid',
  wave: 5,
  types: ['Antimemetic', 'Reality'],
  stats: { template: 'physicalBruiser' },
  moves: ['snap-shut', 'blink', 'tickle', 'weep'],
  moveNames: { blink: 'Lunging Clasp', tickle: 'Nibble', weep: 'Gorge' },
  signatureMove: phys('snap-shut', 'Snap Shut', 'Reality', 85, 100),
  ability: 'toothedMaw',
  eligibility: "A disguised, toothed bag that lures people into reaching in, then bites.",
  dossier: {
    nickname: "Hungry Bag",
    authors: "Jo Black",
    images: [],
  },
} satisfies ScpDefinition
