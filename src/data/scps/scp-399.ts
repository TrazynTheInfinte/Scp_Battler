import { spec, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-399',
  name: 'SCP-399',
  objectClass: 'Safe',
  wave: 15,
  types: ['Reality', 'Thaumic'],
  stats: { template: 'fastSpecial' },
  moves: ['transmute', 'unmake', 'data-surge', 'smite'],
  moveNames: { unmake: 'Unbind Atoms', 'data-surge': 'Draw Power', smite: 'Remake Matter' },
  signatureMove: spec('transmute', 'Transmute', 'Reality', 80, 100, [foe({ def: -1 }, 30)]),
  ability: 'drawsPower',
  eligibility: "A ring that lets its wearer rearrange matter at the atomic level, fed by any power source nearby.",
  dossier: {
    nickname: "Atomic Manipulation Ring",
    authors: "ThrashDriveshaft and Smapti",
    images: [],
  },
} satisfies ScpDefinition
