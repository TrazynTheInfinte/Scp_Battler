import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-3201',
  name: 'SCP-3201',
  objectClass: 'Thaumiel',
  wave: 9,
  types: ['Kinetic', 'Temporal'],
  stats: { template: 'fastSpecial' },
  moves: ['ball-lightning', 'turn-back-time', 'refine', 'obscure'],
  moveNames: { 'turn-back-time': 'Archived Moment', refine: 'Barter', obscure: 'Dazzling Arc' },
  signatureMove: spec('ball-lightning', 'Ball Lightning', 'Kinetic', 85, 100, [inflict('Stunned', 20)]),
  ability: 'plasmaBody',
  eligibility: "The Archivists: sapient balls of lightning that trade with humans for things from other universes.",
  dossier: {
    nickname: "well, it was low-entropy while it lasted.",
    authors: "xplkqlkcassia",
    images: [],
  },
} satisfies ScpDefinition
