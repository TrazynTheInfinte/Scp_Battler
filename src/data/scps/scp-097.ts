import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-097',
  name: 'SCP-097',
  objectClass: 'Euclid',
  wave: 10,
  types: ['Biological', 'Temporal'],
  stats: { template: 'slowSpecial' },
  moves: ['midway-maze', 'acidic-bile', 'decay', 'sedative'],
  moveNames: { 'acidic-bile': 'Rotting Pulp', decay: 'Autumn Rot', sedative: 'Sleepwalk Lure' },
  signatureMove: spec('midway-maze', 'Midway Maze', 'Temporal', 80, 100, [inflict('Contained', 30)]),
  ability: 'lostInTheFair',
  eligibility: "An overgrown 1969 fairground ruled by a 15-tonne pumpkin, where the rides and vines maim anyone who wanders in.",
  dossier: {
    nickname: "Old Fairgrounds",
    authors: "Dexanote",
    images: [],
  },
} satisfies ScpDefinition
