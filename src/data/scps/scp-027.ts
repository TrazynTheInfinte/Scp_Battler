import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-027',
  name: 'SCP-027',
  objectClass: 'Euclid',
  wave: 3,
  types: ['Biological', 'Kinetic'],
  stats: { template: 'physicalBruiser' },
  moves: ['vermin-tide', 'tickle', 'stalk', 'ambush'],
  moveNames: { tickle: 'Gnawing Rats', stalk: 'Gathering Swarm', ambush: 'Plague of Rats' },
  signatureMove: phys('vermin-tide', 'Vermin Tide', 'Biological', 80, 100),
  ability: 'verminSwarm',
  eligibility: "Swarms of insects and vermin follow its host and attack anyone who comes near.",
  dossier: {
    nickname: 'The Vermin God',
    authors: 'Quikngruvn',
    images: [],
  },
} satisfies ScpDefinition
