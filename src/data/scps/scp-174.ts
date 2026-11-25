import { spec, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-174',
  name: 'SCP-174',
  objectClass: 'Euclid',
  wave: 7,
  types: ['Memetic', 'Thaumic'],
  stats: { template: 'support' },
  moves: ['thrown-voice', 'blood-ink', 'corrupt-file', 'erasure'],
  signatureMove: spec('thrown-voice', 'Thrown Voice', 'Memetic', 85, 100, [foe({ acc: -1 }, 30)]),
  ability: 'devotedHandlers',
  eligibility: "A dummy that compels its handlers to speak for it and guard it, sometimes lethally.",
  dossier: {
    nickname: "Ventriloquist's Dummy",
    authors: "RichardJ28",
    images: [],
  },
} satisfies ScpDefinition
