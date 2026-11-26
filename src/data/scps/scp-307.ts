import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-307',
  name: 'SCP-307',
  objectClass: 'Keter',
  wave: 13,
  types: ['Biological', 'Memetic'],
  stats: { template: 'physicalBruiser' },
  moves: ['strangling-vines', 'crimson-residue', 'ambush', 'rend'],
  moveNames: { 'crimson-residue': 'Thorn Feed', ambush: 'Creeping Grasp', rend: 'Constrict' },
  signatureMove: phys('strangling-vines', 'Strangling Vines', 'Biological', 80, 100, [inflict('Contained', 30)]),
  ability: 'ensnaredPrey',
  eligibility: "A thorned ivy with some intelligence that grabs warm-blooded animals and feeds on them.",
  dossier: {
    nickname: "Carnivorous Ivy",
    authors: "apocalemur",
    images: [],
  },
} satisfies ScpDefinition
