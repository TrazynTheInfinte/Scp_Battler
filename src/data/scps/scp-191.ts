import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-191',
  name: 'SCP-191',
  objectClass: 'Safe',
  wave: 10,
  types: ['Mechanical', 'Memetic'],
  stats: { template: 'fastSpecial' },
  moves: ['direct-interface', 'data-surge', 'corrupt-file', 'overclock'],
  moveNames: { 'data-surge': 'Data Port Surge', 'corrupt-file': 'Rewrite Code', overclock: 'EM Sense' },
  signatureMove: spec('direct-interface', 'Direct Interface', 'Mechanical', 80, 100, [inflict('Amnesiac', 30)]),
  ability: 'reducedPain',
  eligibility: "A cyborg child who reads and writes computer data directly and senses the whole EM spectrum.",
  dossier: {
    nickname: "Cyborg Child",
    authors: "DrClef and Sylocat",
    images: [],
  },
} satisfies ScpDefinition
