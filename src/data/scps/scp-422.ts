import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-422',
  name: 'SCP-422',
  objectClass: 'Safe',
  wave: 15,
  types: ['Biological', 'Thaumic'],
  stats: { template: 'physicalBruiser' },
  moves: ['stitched-maul', 'crushing-jaws', 'crimson-residue', 'relentless-pursuit'],
  moveNames: { 'crushing-jaws': 'Borrowed Jaws', 'crimson-residue': 'Torn Stitches', 'relentless-pursuit': 'Mismatched Charge' },
  signatureMove: phys('stitched-maul', 'Stitched Maul', 'Thaumic', 80, 100),
  ability: 'stitchedTogether',
  eligibility: "A quadruped stitched together from pieces of other animals, every organ made of other organs.",
  dossier: {
    nickname: "Patchwork Beast",
    authors: "Quillpaw",
    images: [],
  },
} satisfies ScpDefinition
