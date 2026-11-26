import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-9747',
  name: 'SCP-9747',
  objectClass: 'Apollyon',
  wave: 8,
  types: ['Mechanical', 'Antimemetic'],
  stats: { template: 'specialBruiser', tweaks: { spa: -20, spd: 20 } },
  moves: ['termination', 'data-surge', 'corrupt-file', 'memory-hole'],
  moveNames: { 'data-surge': 'Rule Rewrite', 'corrupt-file': 'Narrative Audit', 'memory-hole': 'Book Chamber' },
  signatureMove: spec('termination', 'TERMINATION()', 'Mechanical', 90, 100, [inflict('Contained', 20)]),
  ability: 'containmentProtocols',
  eligibility: "A runaway quantum program that writes rules to contain anomalies, and has just learned TERMINATION().",
  dossier: {
    nickname: "Secure Continere Praeservare",
    authors: "lordmafika, cakoh",
    images: [],
  },
} satisfies ScpDefinition
