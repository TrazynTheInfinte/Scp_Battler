import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-7004',
  name: 'SCP-7004',
  objectClass: 'Apollyon',
  wave: 8,
  types: ['Memetic', 'Biological'],
  stats: { template: 'fastPhysical' },
  moves: ['realization', 'crimson-residue', 'relentless-pursuit', 'stalk'],
  signatureMove: phys('realization', 'Realization', 'Memetic', 90, 100),
  ability: 'wailingBloom',
  eligibility: "An idea that, once understood, bursts out of the thinker as screaming humanoids that spread it.",
  dossier: {
    nickname: "Insane, Wailing, Feral.",
    authors: "Ecronak and AnAnomalousWriter",
    mature: true,
    images: [],
  },
} satisfies ScpDefinition
