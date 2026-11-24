import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-509-ex',
  name: 'SCP-509-EX',
  objectClass: 'Euclid',
  wave: 6,
  types: ['Mundane'],
  stats: { template: 'armoredStriker' },
  moves: ['boiler-blast', 'strike', 'quick-jab', 'brace'],
  signatureMove: phys('boiler-blast', 'Boiler Blast', 'Mundane', 90, 95),
  ability: 'fullSteam',
  eligibility: "A run of locomotives that exploded and killed their crews; just an aging machine and a statistical fluke.",
  dossier: {
    nickname: "Train-313",
    authors: "Archangel_777",
    images: [],
  },
} satisfies ScpDefinition
