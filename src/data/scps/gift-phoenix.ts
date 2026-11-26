import { inflict, phys, self, spec, status } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'gift-phoenix',
  name: 'SCP-ADM-1',
  objectClass: 'Keter',
  wave: 11,
  gift: 'admin',
  types: ['Thaumic', 'Kinetic'],
  stats: { template: 'fastSpecial' },
  moves: ['ashfall', 'pyre', 'cinder-wing', 'rising-heat'],
  ownMoves: [
    spec('ashfall', 'Ashfall', 'Thaumic', 70, 100, [inflict('Bleeding', 30)]),
    spec('pyre', 'Pyre', 'Thaumic', 110, 85),
    phys('cinder-wing', 'Cinder Wing', 'Kinetic', 80, 100),
    status('rising-heat', 'Rising Heat', 'Thaumic', null, [self({ spa: 1, spe: 1 })]),
  ],
  ability: 'rebirth',
  eligibility: 'An admin gift. A bird of ash that has burned down six Sites and come back from every one.',
  dossier: {
    nickname: 'The Phoenix',
    authors: 'SCP Battler original',
    images: [],
  },
} satisfies ScpDefinition
