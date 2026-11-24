import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-140',
  name: 'SCP-140',
  objectClass: 'Keter',
  wave: 6,
  types: ['Thaumic', 'Temporal'],
  stats: { template: 'balanced' },
  moves: ['daevite-rite', 'decay', 'crescendo', 'coarse'],
  signatureMove: spec('daevite-rite', 'Daevite Rite', 'Thaumic', 85, 100, [inflict('Bleeding', 20)]),
  ability: 'expandingChronicle',
  eligibility: "A chronicle of the Daevas that writes their history, and their armies, back into the world when blood or ink touches it.",
  dossier: {
    nickname: "An Incomplete Chronicle",
    authors: "AssertiveRoland",
    images: [],
  },
} satisfies ScpDefinition
