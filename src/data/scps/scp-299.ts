import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-299',
  name: 'SCP-299',
  objectClass: 'Keter',
  wave: 13,
  types: ['Biological', 'Temporal'],
  stats: { template: 'wall' },
  moves: ['thorn-lash', 'corrosive-touch', 'decay', 'calming-ooze'],
  moveNames: { 'corrosive-touch': 'Root Conversion', decay: 'Leaf Shedding', 'calming-ooze': 'Black Sap' },
  signatureMove: phys('thorn-lash', 'Thorn Lash', 'Biological', 80, 100, [inflict('Bleeding', 30)]),
  ability: 'blackThorns',
  eligibility: "A black, thorned tree that turns every plant its roots touch into another of itself.",
  dossier: {
    nickname: "Infectious Tree",
    authors: "InnocentBystander",
    images: [],
  },
} satisfies ScpDefinition
