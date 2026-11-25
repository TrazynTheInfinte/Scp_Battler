import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-6167',
  name: 'SCP-6167',
  objectClass: 'Apollyon',
  wave: 8,
  types: ['Biological', 'Thaumic'],
  stats: { template: 'fastPhysical' },
  moves: ['furies-hunger', 'rend', 'crimson-residue', 'ambush'],
  moveNames: { rend: 'Shapeshift Claws', 'crimson-residue': "Martyr's Cut", ambush: 'Demon Pounce' },
  signatureMove: phys('furies-hunger', "Furies' Hunger", 'Thaumic', 90, 100, [inflict('Bleeding', 20)]),
  ability: 'mutableFlesh',
  eligibility: "The Furies: immortal, shapeshifting demons breaking out of a nine-floor prison.",
  dossier: {
    nickname: "████ is Empty",
    authors: "Fantem",
    images: [],
  },
} satisfies ScpDefinition
