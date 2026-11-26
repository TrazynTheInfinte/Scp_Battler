import { inflict, phys, spec, withdraw } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'gift-lucky-break',
  name: 'SCP-PT-1',
  objectClass: 'Safe',
  wave: 11,
  gift: 'playtester',
  types: ['Mundane', 'Thaumic'],
  stats: { template: 'mixedAttacker' },
  moves: ['jackpot', 'all-in', 'cash-out', 'snake-eyes'],
  ownMoves: [
    { ...spec('jackpot', 'Jackpot', 'Thaumic', 90, 100), powerRange: [20, 160] },
    { ...phys('all-in', 'All In', 'Mundane', 120, 80), missRecoil: 1 / 4 },
    phys('cash-out', 'Cash Out', 'Mundane', 70, 100, [withdraw]),
    spec('snake-eyes', 'Snake Eyes', 'Thaumic', 60, 100, [inflict('Stunned', 30)]),
  ],
  ability: 'loadedDice',
  eligibility:
    'A gift for playtesters. A pair of dice found in a Site breakroom: nobody who rolls them ever loses twice in a row. It fights by gambling.',
  dossier: {
    nickname: 'The Lucky Break',
    authors: 'SCP Battler original',
    images: [],
  },
} satisfies ScpDefinition
