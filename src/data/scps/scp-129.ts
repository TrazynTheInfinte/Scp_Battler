import { spec, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-129',
  name: 'SCP-129',
  objectClass: 'Keter',
  wave: 6,
  types: ['Biological', 'Temporal'],
  stats: { template: 'balanced' },
  moves: ['staged-infection', 'acidic-bile', 'calming-ooze', 'coarse'],
  moveNames: { 'acidic-bile': 'Spore Burst', 'calming-ooze': 'Numbing Spores', coarse: 'Fungal Crust' },
  signatureMove: spec('staged-infection', 'Staged Infection', 'Temporal', 85, 100, [foe({ spd: -1 }, 30)]),
  ability: 'fungalBloom',
  eligibility: "A fungus that infects in stages, each weakening the host for the next, until it is a mound of flesh.",
  dossier: {
    nickname: "Progressive Fungal Infection",
    authors: "Quikngruvn",
    images: [],
  },
} satisfies ScpDefinition
