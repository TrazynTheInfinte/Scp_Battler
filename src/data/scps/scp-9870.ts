import { spec, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-9870',
  name: 'SCP-9870',
  objectClass: 'Apollyon',
  wave: 8,
  types: ['Temporal', 'Kinetic'],
  stats: { template: 'slowSpecial' },
  moves: ['primal-cold', 'corrupt-file', 'flank', 'negative-space'],
  signatureMove: spec('primal-cold', 'Primal Cold', 'Temporal', 85, 100, [foe({ spe: -1 }, 30)]),
  ability: 'absoluteZero',
  eligibility: "A spreading cold that blocks all new heat and slows time, freezing victims where they stand.",
  dossier: {
    nickname: "Primal Cold",
    authors: "SeekGull",
    mature: true,
    images: [],
  },
} satisfies ScpDefinition
