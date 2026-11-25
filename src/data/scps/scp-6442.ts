import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-6442',
  name: 'SCP-6442',
  objectClass: 'Thaumiel',
  wave: 9,
  types: ['Memetic', 'Antimemetic'],
  stats: { template: 'specialBruiser' },
  moves: ['forbidden-inscription', 'memory-hole', 'corrupt-file', 'erasure'],
  moveNames: { 'memory-hole': 'Read Too Far', 'corrupt-file': 'Glimpsed Runes', erasure: 'Neural Halt' },
  signatureMove: spec('forbidden-inscription', 'Forbidden Inscription', 'Memetic', 90, 100),
  ability: 'tooMuchKnowledge',
  eligibility: "An inscription that kills any mind that reads it, used against omniscient beings.",
  dossier: {
    nickname: "Mimir, Mímir",
    authors: "Dr Shoulder and Yossipossi",
    images: [],
  },
} satisfies ScpDefinition
