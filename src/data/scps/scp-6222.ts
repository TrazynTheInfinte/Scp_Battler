import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-6222',
  name: 'SCP-6222',
  objectClass: 'Thaumiel',
  wave: 9,
  types: ['Biological', 'Antimemetic'],
  stats: { template: 'balanced' },
  moves: ['leviathans-wake', 'acidic-bile', 'crushing-jaws', 'memory-hole'],
  signatureMove: spec('leviathans-wake', "Leviathan's Wake", 'Antimemetic', 85, 100),
  ability: 'cellBlock',
  eligibility: "A prison of sapient sea-creature criminals, from a stabbing isopod to an antimemetic leviathan.",
  dossier: {
    nickname: "FISH PRISON",
    authors: "Aftokrator",
    images: [],
  },
} satisfies ScpDefinition
