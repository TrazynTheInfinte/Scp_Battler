import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-682',
  name: 'SCP-682',
  objectClass: 'Keter',
  wave: 1,
  types: ['Kinetic', 'Biological'],
  // Pre-template stats, to be fitted to a stat template.
  stats: { legacy: { hp: 90, atk: 115, def: 100, spa: 120, spd: 100, spe: 75 } },
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
