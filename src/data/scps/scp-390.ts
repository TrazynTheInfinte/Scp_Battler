import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-390',
  name: 'SCP-390',
  objectClass: 'Safe',
  wave: 15,
  types: ['Thaumic', 'Mechanical'],
  stats: { template: 'slowSpecial' },
  moves: ['death-ray', 'blinding-light', 'data-surge', 'refine'],
  moveNames: { 'blinding-light': 'Lens Flare', 'data-surge': 'Charge the Lenses', refine: 'Focused Beam' },
  signatureMove: spec('death-ray', 'Death Ray', 'Thaumic', 100, 85),
  ability: 'ancientFrame',
  eligibility: "The remains of a six-metre wood-and-glass heat ray, built by hand in antiquity and still able to fire.",
  dossier: {
    nickname: "Ancient Death Ray",
    authors: "Aelanna",
    images: [],
  },
} satisfies ScpDefinition
