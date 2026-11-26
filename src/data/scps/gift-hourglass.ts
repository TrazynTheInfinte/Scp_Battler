import { foe, inflict, phys, spec, status } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'gift-hourglass',
  name: 'SCP-ADM-3',
  objectClass: 'Thaumiel',
  wave: 11,
  gift: 'admin',
  types: ['Temporal', 'Reality'],
  stats: { template: 'mixedAttacker' },
  moves: ['foretold-strike', 'erosion', 'still-moment', 'fracture'],
  ownMoves: [
    { ...spec('foretold-strike', 'Foretold Strike', 'Temporal', 120, 100), delay: 2 },
    spec('erosion', 'Erosion', 'Temporal', 65, 100, [foe({ def: -1 })]),
    status('still-moment', 'Still Moment', 'Temporal', 75, [inflict('Stunned')]),
    phys('fracture', 'Fracture', 'Reality', 85, 100),
  ],
  ability: 'rewind',
  eligibility: 'An admin gift. Sand that falls upward, and a past that is never quite finished.',
  dossier: {
    nickname: 'The Hourglass',
    authors: 'SCP Battler original',
    images: [],
  },
} satisfies ScpDefinition
