import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-3667',
  name: 'SCP-3667',
  objectClass: 'Thaumiel',
  wave: 9,
  types: ['Thaumic', 'Kinetic'],
  stats: { template: 'physicalBruiser' },
  moves: ['hellmouth', 'rend', 'crimson-residue', 'ambush'],
  moveNames: { rend: 'Hell Claws', 'crimson-residue': 'Burning Oil', ambush: 'From the Sinkhole' },
  signatureMove: phys('hellmouth', 'Hellmouth', 'Thaumic', 90, 100, [inflict('Bleeding', 20)]),
  ability: 'regeneratingHide',
  eligibility: "A hell under a diamond mine, full of winged, feline and colossal regenerating monsters.",
  dossier: {
    nickname: "All's Well that Ends Hell",
    authors: "Quantum Physician",
    images: [],
  },
} satisfies ScpDefinition
