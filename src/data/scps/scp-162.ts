import { status, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-162',
  name: 'SCP-162',
  objectClass: 'Euclid',
  wave: 6,
  types: ['Mechanical', 'Memetic'],
  stats: { template: 'wall' },
  moves: ['compel-touch', 'corrupt-file', 'gear-grind', 'coarse'],
  moveNames: { 'corrupt-file': 'Urge to Touch', 'gear-grind': 'Hook Barrage', coarse: 'Barbed Shell' },
  signatureMove: status('compel-touch', 'Compel Touch', 'Memetic', 90, [inflict('Contained')]),
  ability: 'fishHooks',
  eligibility: "A ball of hooks and needles that compels people to touch it, then holds them until they bleed out.",
  dossier: {
    nickname: "Ball of Sharp",
    authors: "Dr Gears",
    images: [],
  },
} satisfies ScpDefinition
