import { spec, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-496',
  name: 'SCP-496',
  objectClass: 'Keter',
  wave: 17,
  types: ['Biological', 'Reality'],
  stats: { template: 'wall' },
  moves: ['calcify', 'acidic-bile', 'unmake', 'lay-snare'],
  moveNames: { 'acidic-bile': 'Brine Burn', unmake: 'Coral Overgrowth', 'lay-snare': 'Reef Bed' },
  signatureMove: spec('calcify', 'Calcify', 'Biological', 80, 100, [foe({ spe: -1 }, 30)]),
  ability: 'reefSpread',
  eligibility: "A contagion on the sea floor that turns whatever it touches into living coral.",
  dossier: {
    nickname: "A Sunken Contagion",
    authors: "Dr_Adams, Anonymous, Vivarium",
    images: [],
  },
} satisfies ScpDefinition
