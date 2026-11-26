import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-247',
  name: 'SCP-247',
  objectClass: 'Euclid',
  wave: 12,
  types: ['Memetic', 'Kinetic'],
  stats: { template: 'fastPhysical' },
  moves: ['tigers-pounce', 'crushing-jaws', 'contagious-joy', 'stalk'],
  moveNames: { 'crushing-jaws': 'Real Teeth', 'contagious-joy': 'Cute Distraction', stalk: 'Prowl' },
  signatureMove: phys('tigers-pounce', "Tiger's Pounce", 'Kinetic', 85, 100, [inflict('Bleeding', 20)]),
  ability: 'harmlessLooking',
  eligibility: "A full-grown tiger that everyone sees as a harmless kitten, right up until it bites.",
  dossier: {
    nickname: "A Harmless Kitten",
    authors: "GwenWinterheart",
    images: [],
  },
} satisfies ScpDefinition
