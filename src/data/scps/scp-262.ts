import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-262',
  name: 'SCP-262',
  objectClass: 'Euclid',
  wave: 12,
  types: ['Thaumic', 'Reality'],
  stats: { template: 'physicalBruiser' },
  moves: ['many-arms', 'ambush', 'rend', 'coarse'],
  moveNames: { ambush: 'Hidden Grasp', rend: 'Tearing Grip', coarse: 'Thick Wool' },
  signatureMove: phys('many-arms', 'Many Arms', 'Reality', 80, 100, [inflict('Contained', 30)]),
  ability: 'graspingLining',
  eligibility: "A greatcoat whose lining opens onto somewhere full of arms that grab, carry and strangle.",
  dossier: {
    nickname: "A Coat of Many Arms",
    authors: "The Administrator",
    images: [],
  },
} satisfies ScpDefinition
