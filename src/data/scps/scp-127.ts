import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-127',
  name: 'SCP-127',
  objectClass: 'Safe',
  wave: 5,
  types: ['Biological', 'Mechanical'],
  stats: { template: 'fastPhysical' },
  moves: ['tooth-burst', 'crimson-residue', 'roll-out', 'overclock'],
  moveNames: { 'crimson-residue': 'Bloody Recoil', 'roll-out': 'Cylinder Spin', overclock: 'Quick Reload' },
  signatureMove: phys('tooth-burst', 'Tooth Burst', 'Mechanical', 80, 100, [inflict('Bleeding', 20)]),
  ability: 'regrowingMagazine',
  eligibility: "A living submachine gun that fires teeth, and regrows its magazine after emptying it.",
  dossier: {
    nickname: "The Living Gun",
    authors: "Arcibi",
    images: [],
  },
} satisfies ScpDefinition
