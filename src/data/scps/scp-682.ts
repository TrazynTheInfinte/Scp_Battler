import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-682',
  name: 'SCP-682',
  objectClass: 'Keter',
  wave: 1,
  types: ['Kinetic', 'Biological'],
  stats: { template: 'mixedAttacker', tweaks: { spa: 5, spe: -5 } },
  moves: ['crushing-jaws', 'acidic-bile', 'rampage', 'regenerate'],
  signatureMove: phys('rampage', 'Rampage', 'Kinetic', 110, 80),
  ability: 'adaptive',
  eligibility: 'A hostile, near-indestructible creature.',
  dossier: {
    nickname: 'Hard-to-Destroy Reptile',
    authors: 'Dr Gears and Epic Phail Spy',
    images: [
      { file: 'monster8editub9-new.jpg', author: 'OccultistMave', license: 'CC BY-SA 3.0', note: 'Derivative of "Beached humpback whale at Kincaid Park. Anchorage, Alaska" by Paxson Woelber, CC BY 2.0' },
    ],
    art: 'monster8editub9-new.jpg',
  },
} satisfies ScpDefinition
