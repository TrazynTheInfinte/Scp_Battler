import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-9380',
  name: 'SCP-9380',
  objectClass: 'Apollyon',
  wave: 8,
  types: ['Kinetic', 'Thaumic'],
  stats: { template: 'mixedAttacker' },
  moves: ['twelve-guns', 'smite', 'ambush', 'flank'],
  moveNames: { smite: 'Wrath of Vanaman', ambush: 'Twelve Hands', flank: 'Chaos Step' },
  signatureMove: phys('twelve-guns', 'Twelve Guns', 'Kinetic', 95, 85),
  ability: 'lordOfChaos',
  eligibility: "Lord Vanaman, a twelve-handed god of violence, chaos and firearms.",
  dossier: {
    nickname: "In my hands",
    authors: "Detective_O 1",
    mature: true,
    images: [],
  },
} satisfies ScpDefinition
