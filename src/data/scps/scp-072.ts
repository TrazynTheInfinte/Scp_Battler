import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-072',
  name: 'SCP-072',
  objectClass: 'Safe',
  wave: 4,
  types: ['Antimemetic'],
  stats: { template: 'fastPhysical' },
  moves: ['flay', 'sedative', 'blink', 'bone-saw'],
  moveNames: { sedative: 'Night Terror', blink: 'From Under the Bed', 'bone-saw': 'Clawed Grip' },
  signatureMove: phys('flay', 'Flay', 'Antimemetic', 70, 100, [inflict('Bleeding', 20)]),
  ability: 'sleepersPrey',
  eligibility: "A shadowy hand that paralyzes a sleeper, then cuts away at their exposed foot.",
  dossier: {
    nickname: "The Foot of the Bed",
    authors: "Kate McTiriss",
    images: [],
  },
} satisfies ScpDefinition
