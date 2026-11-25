import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-4273',
  name: 'SCP-4273',
  objectClass: 'Apollyon',
  wave: 8,
  types: ['Biological', 'Thaumic'],
  stats: { template: 'physicalBruiser' },
  moves: ['bone-shard-volley', 'ambush', 'rend', 'corrosive-touch'],
  moveNames: { ambush: 'Klavigar Lunge', rend: 'Armored Talons', 'corrosive-touch': 'Liquefy' },
  signatureMove: phys('bone-shard-volley', 'Bone Shard Volley', 'Biological', 80, 100, [inflict('Bleeding', 30)]),
  ability: 'grandKarcist',
  eligibility: "A returning Grand Karcist and his Sarkic followers, who hurl bone shards and turn into armored monsters.",
  dossier: {
    nickname: "Designated Successor",
    authors: "MalyceGraves",
    images: [],
  },
} satisfies ScpDefinition
