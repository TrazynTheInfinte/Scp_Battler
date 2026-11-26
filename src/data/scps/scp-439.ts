import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-439',
  name: 'SCP-439',
  objectClass: 'Euclid',
  wave: 15,
  types: ['Biological', 'Antimemetic'],
  stats: { template: 'fastPhysical' },
  moves: ['bone-boring', 'tickle', 'rend', 'ambush'],
  moveNames: { tickle: 'Forceps Pinch', rend: 'Hollow Bones', ambush: 'Nest Within' },
  signatureMove: phys('bone-boring', 'Bone Boring', 'Biological', 80, 100, [inflict('Bleeding', 30)]),
  ability: 'hiveOfBone',
  eligibility: "An earwig that nests in a host and turns their skeleton into its hive.",
  dossier: {
    nickname: "Bone Hive",
    authors: "Multimoog",
    images: [],
  },
} satisfies ScpDefinition
