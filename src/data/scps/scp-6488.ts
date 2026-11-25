import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-6488',
  name: 'SCP-6488',
  objectClass: 'Thaumiel',
  wave: 9,
  types: ['Mechanical', 'Antimemetic'],
  stats: { template: 'specialBruiser' },
  moves: ['simulated-reality', 'data-surge', 'corrupt-file', 'memory-hole'],
  moveNames: { 'data-surge': 'Infosignature', 'corrupt-file': 'Deviance Scan', 'memory-hole': 'Lotus Dream' },
  signatureMove: spec('simulated-reality', 'Simulated Reality', 'Mechanical', 85, 100, [inflict('Contained', 30)]),
  ability: 'deviantDetection',
  eligibility: "LOTUS, an AI that traps rogue AIs in simulated worlds they believe are real.",
  dossier: {
    nickname: "EIGHTH COMMANDMENT",
    authors: "Jack Ike, Liryn and Placeholder McD",
    images: [],
  },
} satisfies ScpDefinition
