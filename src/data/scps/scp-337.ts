import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-337',
  name: 'SCP-337',
  objectClass: 'Euclid',
  wave: 14,
  types: ['Biological', 'Kinetic'],
  stats: { template: 'physicalBruiser' },
  moves: ['hair-lash', 'crushing-jaws', 'tickle', 'ambush'],
  moveNames: { 'crushing-jaws': 'Crushing Coil', tickle: 'Stray Strands', ambush: 'Tangle Trap' },
  signatureMove: phys('hair-lash', 'Hair Lash', 'Biological', 85, 100, [inflict('Contained', 30)]),
  ability: 'thousandStrands',
  eligibility: "A 60 kg living mass of human hair that controls every strand and strikes with crushing force.",
  dossier: {
    nickname: "Hairball",
    authors: "tombones",
    images: [],
  },
} satisfies ScpDefinition
