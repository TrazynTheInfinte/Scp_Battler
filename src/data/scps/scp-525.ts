import { phys, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-525',
  name: 'SCP-525',
  objectClass: 'Euclid',
  wave: 17,
  types: ['Biological', 'Memetic'],
  stats: { template: 'fastPhysical' },
  moves: ['eye-crawl', 'flurry', 'obscure', 'relentless-pursuit'],
  moveNames: { flurry: 'Many Legs', obscure: 'In the Eye', 'relentless-pursuit': 'Skitter' },
  signatureMove: phys('eye-crawl', 'Eye Crawl', 'Memetic', 80, 100, [foe({ acc: -1 }, 30)]),
  ability: 'everywhereLegs',
  eligibility: "Loose spider legs that crawl together and burrow into eyes.",
  dossier: {
    nickname: "Eye Spiders",
    authors: "Yubi Shines",
    images: [],
  },
} satisfies ScpDefinition
