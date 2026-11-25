import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-378',
  name: 'SCP-378',
  objectClass: 'Thaumiel',
  wave: 9,
  types: ['Biological', 'Memetic'],
  stats: { template: 'mixedAttacker' },
  moves: ['brainworm', 'relentless-pursuit', 'crushing-jaws', 'erasure'],
  signatureMove: phys('brainworm', 'Brainworm', 'Biological', 85, 100, [inflict('Amnesiac', 30)]),
  ability: 'puppetHosts',
  eligibility: "A giant sapient arthropod whose offspring burrow into hosts and steer them; the Foundation uses its puppets as spies.",
  dossier: {
    nickname: "Brainworm",
    authors: "ThrashDriveshaft and UraniumEmpire",
    images: [],
  },
} satisfies ScpDefinition
