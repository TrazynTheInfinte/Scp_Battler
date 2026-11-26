import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-278',
  name: 'SCP-278',
  objectClass: 'Safe',
  wave: 13,
  types: ['Mechanical', 'Temporal'],
  stats: { template: 'armoredStriker' },
  moves: ['hydraulic-stomp', 'roll-out', 'unmake', 'corrosive-touch'],
  moveNames: { 'roll-out': 'Skitter', unmake: 'Rip Apart', 'corrosive-touch': 'Rusted Fang' },
  signatureMove: phys('hydraulic-stomp', 'Hydraulic Stomp', 'Mechanical', 85, 100),
  ability: 'steamVents',
  eligibility: "A 16-metre clockwork spider of steel and banyan wood, recently refitted with modern hydraulics.",
  dossier: {
    nickname: "A Large Mechanical Spider",
    authors: "FritzWillie",
    images: [],
  },
} satisfies ScpDefinition
