import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-285',
  name: 'SCP-285',
  objectClass: 'Euclid',
  wave: 13,
  types: ['Mechanical', 'Biological'],
  stats: { template: 'mixedAttacker' },
  moves: ['ethernet-overload', 'crimson-residue', 'data-surge', 'regenerate'],
  moveNames: { 'crimson-residue': 'Flesh Shift', 'data-surge': 'Packet Flood', regenerate: 'Regrow Limbs' },
  signatureMove: spec('ethernet-overload', 'Ethernet Overload', 'Mechanical', 80, 100, [inflict('Amnesiac', 20)]),
  ability: 'mutatingBody',
  eligibility: "A shapeless humanoid that grows and loses limbs at random, with an Ethernet port in its back.",
  dossier: {
    nickname: "A Hack Job",
    authors: "Zer0Ne0phyte",
    images: [],
  },
} satisfies ScpDefinition
