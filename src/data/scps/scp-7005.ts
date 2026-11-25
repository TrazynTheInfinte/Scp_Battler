import { spec, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-7005',
  name: 'SCP-7005',
  objectClass: 'Thaumiel',
  wave: 9,
  types: ['Memetic', 'Temporal'],
  stats: { template: 'balanced' },
  moves: ['neon-haze', 'decay', 'turn-back-time', 'obscure'],
  signatureMove: spec('neon-haze', 'Neon Haze', 'Memetic', 80, 100, [foe({ atk: -1, spa: -1 }, 30)]),
  ability: 'apathy',
  eligibility: "A neon city spreading across universes, draining the will out of everyone it reaches.",
  dossier: {
    nickname: "The Neon God",
    authors: "Tufto",
    images: [],
  },
} satisfies ScpDefinition
