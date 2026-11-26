import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-409',
  name: 'SCP-409',
  objectClass: 'Keter',
  wave: 15,
  types: ['Reality', 'Kinetic'],
  stats: { template: 'wall' },
  moves: ['crystal-touch', 'unmake', 'rend', 'coarse'],
  moveNames: { unmake: 'Spreading Lattice', rend: 'Shard Edge', coarse: 'Quartz Shell' },
  signatureMove: phys('crystal-touch', 'Crystal Touch', 'Reality', 80, 100, [inflict('Contained', 30)]),
  ability: 'crystalContagion',
  eligibility: "A quartz crystal that slowly and painfully turns anything that touches it into more crystal.",
  dossier: {
    nickname: "Contagious Crystal",
    authors: "Dr Gears",
    images: [],
  },
} satisfies ScpDefinition
