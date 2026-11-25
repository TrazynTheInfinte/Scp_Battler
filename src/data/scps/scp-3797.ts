import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-3797',
  name: 'SCP-3797',
  objectClass: 'Thaumiel',
  wave: 9,
  types: ['Temporal', 'Kinetic'],
  stats: { template: 'fastPhysical' },
  moves: ['retroactive-shot', 'ram', 'flank', 'ambush'],
  signatureMove: phys('retroactive-shot', 'Retroactive Shot', 'Temporal', 85, null),
  ability: 'alreadyFired',
  eligibility: "A gun the Foundation will build and fire once, killing its target in the past.",
  dossier: {
    nickname: "The Once and Future Gun",
    authors: "stormbreath",
    images: [],
  },
} satisfies ScpDefinition
