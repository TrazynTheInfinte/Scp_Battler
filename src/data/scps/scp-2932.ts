import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-2932',
  name: 'SCP-2932',
  objectClass: 'Thaumiel',
  wave: 9,
  types: ['Biological', 'Thaumic'],
  stats: { template: 'wall' },
  moves: ['prison-pod', 'acidic-bile', 'smite', 'calming-ooze'],
  signatureMove: spec('prison-pod', 'Prison Pod', 'Biological', 75, 100, [inflict('Contained', 30)]),
  ability: 'plantGuardians',
  eligibility: "A living plant prison that seals monsters in pods, guarded by plant sentries that attack anyone harming it.",
  dossier: {
    nickname: "Titania's Prison",
    authors: "djkaktus",
    images: [],
  },
} satisfies ScpDefinition
