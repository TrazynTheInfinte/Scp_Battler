import { inflict, self, spec, status } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'gift-conductor',
  name: 'SCP-ADM-2',
  objectClass: 'Euclid',
  wave: 11,
  gift: 'admin',
  types: ['Memetic', 'Mundane'],
  stats: { template: 'specialBruiser' },
  moves: ['overture', 'dissonance', 'rest-note', 'finale'],
  ownMoves: [
    spec('overture', 'Overture', 'Memetic', 60, 100, [self({ spe: 1 })]),
    spec('dissonance', 'Dissonance', 'Memetic', 80, 100, [inflict('Amnesiac', 20)]),
    status('rest-note', 'Rest Note', 'Memetic', null, [self({ spd: 2 })]),
    { ...spec('finale', 'Finale', 'Memetic', 40, 100), powerPerStack: 40 },
  ],
  ability: 'crescendo',
  eligibility: 'An admin gift. An orchestra that plays itself, and everyone who hears it keeps time.',
  dossier: {
    nickname: 'The Conductor',
    authors: 'SCP Battler original',
    images: [],
  },
} satisfies ScpDefinition
