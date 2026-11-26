import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-452',
  name: 'SCP-452',
  objectClass: 'Euclid',
  wave: 16,
  types: ['Biological', 'Memetic'],
  stats: { template: 'support' },
  moves: ['nightmare-bite', 'lay-snare', 'leech', 'sedative'],
  moveNames: { 'lay-snare': 'Dream Webs', leech: 'Drink the Dream', sedative: 'Lull to Sleep' },
  signatureMove: spec('nightmare-bite', 'Nightmare Bite', 'Memetic', 75, 100, [inflict('Stunned', 20)]),
  ability: 'feedsOnSleepers',
  eligibility: "Black widows that spin webs over sleepers and feed on their dreams.",
  dossier: {
    nickname: "Dreamcatcher Spider",
    authors: "Aelanna",
    images: [],
  },
} satisfies ScpDefinition
