import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-6659',
  name: 'SCP-6659',
  objectClass: 'Thaumiel',
  wave: 9,
  types: ['Mechanical', 'Thaumic'],
  stats: { template: 'mixedAttacker' },
  moves: ['decommission', 'smite', 'negative-space', 'blinding-light'],
  moveNames: { smite: 'Deicide', 'negative-space': 'Noosphere Unravel', 'blinding-light': 'Totem Flare' },
  signatureMove: spec('decommission', 'Decommission', 'Mechanical', 90, 100),
  ability: 'godkiller',
  eligibility: "An eigenweapon ship that unravels worshipped gods until they fall dormant.",
  dossier: {
    nickname: "METAGNOSTIC",
    authors: "DodoDevil, Liryn and Placeholder McD",
    images: [],
  },
} satisfies ScpDefinition
