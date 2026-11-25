import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-229',
  name: 'SCP-229',
  objectClass: 'Euclid',
  wave: 7,
  types: ['Mechanical', 'Memetic'],
  stats: { template: 'fastPhysical' },
  moves: ['wire-lash', 'relentless-pursuit', 'overclock', 'crimson-residue'],
  signatureMove: phys('wire-lash', 'Wire Lash', 'Mechanical', 85, 100, [inflict('Bleeding', 20)]),
  ability: 'neuralGrowth',
  eligibility: "A tangle of living wire that grows toward power, burrows into the spine, and takes over the brain.",
  dossier: {
    nickname: "Wire Weed",
    authors: "Dr Gears",
    images: [],
  },
} satisfies ScpDefinition
