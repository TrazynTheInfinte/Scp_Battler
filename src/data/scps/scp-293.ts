import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-293',
  name: 'SCP-293',
  objectClass: 'Keter',
  wave: 13,
  types: ['Antimemetic', 'Reality'],
  stats: { template: 'slowSpecial' },
  moves: ['fixation', 'memory-hole', 'corrupt-file', 'erasure'],
  moveNames: { 'memory-hole': 'Hidden Bond', 'corrupt-file': 'Compulsion', erasure: 'Undetectable' },
  signatureMove: spec('fixation', 'Fixation', 'Reality', 85, 100, [inflict('Stunned', 20)]),
  ability: 'gnawingObsession',
  eligibility: "An unseen presence that bonds to objects and drives whoever holds them into obsession.",
  dossier: {
    nickname: "Obsession",
    authors: "Dr Gears",
    images: [],
  },
} satisfies ScpDefinition
