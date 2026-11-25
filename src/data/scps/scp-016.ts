import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-016',
  name: 'SCP-016',
  objectClass: 'Keter',
  wave: 3,
  types: ['Biological', 'Reality'],
  stats: { template: 'mixedAttacker' },
  moves: ['blood-spray', 'crimson-residue', 'unmake', 'rend'],
  moveNames: { 'crimson-residue': 'Cellular Rupture', unmake: 'Assimilate', rend: 'Tissue Tear' },
  signatureMove: spec('blood-spray', 'Blood Spray', 'Biological', 85, 100, [inflict('Bleeding', 20)]),
  ability: 'teratomorphosis',
  eligibility: "A blood-borne pathogen whose hosts spray infected blood and, under stress, mutate into stronger, aggressive forms.",
  dossier: {
    nickname: 'Sentient Micro-Organism',
    authors: 'DrClef',
    images: [],
  },
} satisfies ScpDefinition
