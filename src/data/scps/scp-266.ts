import { spec, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-266',
  name: 'SCP-266',
  objectClass: 'Euclid',
  wave: 12,
  types: ['Reality', 'Antimemetic'],
  stats: { template: 'fastSpecial' },
  moves: ['heat-sap', 'blinding-light', 'negative-space', 'memory-hole'],
  moveNames: { 'blinding-light': 'Lure Glow', 'negative-space': 'Cold Spot', 'memory-hole': 'Fade Out' },
  signatureMove: spec('heat-sap', 'Heat Sap', 'Reality', 80, 100, [foe({ spe: -1 }, 30)]),
  ability: 'endothermic',
  eligibility: "Glowing wisps that seek out warmth and freeze whoever they cling to.",
  dossier: {
    nickname: "Will o' the Wisp",
    authors: "Dr Kondraki",
    images: [],
  },
} satisfies ScpDefinition
