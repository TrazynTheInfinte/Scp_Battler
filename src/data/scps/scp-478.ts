import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-478',
  name: 'SCP-478',
  objectClass: 'Euclid',
  wave: 16,
  types: ['Biological', 'Antimemetic'],
  stats: { template: 'fastPhysical' },
  moves: ['tooth-pull', 'leech', 'flurry', 'blink'],
  moveNames: { leech: 'Drink From the Root', flurry: 'Swarm Pluck', blink: 'Flit Away' },
  signatureMove: phys('tooth-pull', 'Tooth Pull', 'Biological', 75, 100, [inflict('Bleeding', 30)]),
  ability: 'fluttering',
  eligibility: "Moth-like things that flutter in through windows and take teeth, and more.",
  dossier: {
    nickname: "Tooth Fairies",
    authors: "Dexanote",
    images: [],
  },
} satisfies ScpDefinition
