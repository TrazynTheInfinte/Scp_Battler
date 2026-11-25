import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-068',
  name: 'SCP-068',
  objectClass: 'Safe',
  wave: 4,
  types: ['Mechanical'],
  stats: { template: 'armoredStriker' },
  moves: ['wire-rend', 'roll-out', 'rend', 'coarse'],
  moveNames: { 'roll-out': 'Wire Tumble', rend: 'Razor Wire', coarse: 'Wire Frame' },
  signatureMove: phys('wire-rend', 'Wire Rend', 'Mechanical', 75, 100, [inflict('Bleeding', 20)]),
  ability: 'selfReplicating',
  eligibility: "A wire figure that tears through anything soft and rebuilds itself from any metal nearby.",
  dossier: {
    nickname: "The Wire Figure",
    authors: "Dr Wacey",
    images: [],
  },
} satisfies ScpDefinition
