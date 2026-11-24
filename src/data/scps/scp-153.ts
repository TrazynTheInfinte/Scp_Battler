import { phys, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-153',
  name: 'SCP-153',
  objectClass: 'Euclid',
  wave: 6,
  types: ['Antimemetic'],
  stats: { template: 'fastPhysical' },
  moves: ['drain-ambush', 'crimson-residue', 'flank', 'stalk'],
  signatureMove: phys('drain-ambush', 'Drain Ambush', 'Antimemetic', 80, 100, [foe({ def: -1 }, 30)]),
  ability: 'camouflaged',
  eligibility: "Camouflaged worms in the drains that dissolve the grate with acid and drag people down.",
  dossier: {
    nickname: "Drain Worms",
    authors: "Quikngruvn",
    images: [],
  },
} satisfies ScpDefinition
