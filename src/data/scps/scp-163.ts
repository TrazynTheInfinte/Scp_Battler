import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-163',
  name: 'SCP-163',
  objectClass: 'Safe',
  wave: 6,
  types: ['Mechanical', 'Thaumic'],
  stats: { template: 'armoredStriker' },
  moves: ['manipulator-strike', 'ambush', 'roll-out', 'coarse'],
  moveNames: { ambush: 'Probe Strike', 'roll-out': 'Treads', coarse: 'Hull Plating' },
  signatureMove: phys('manipulator-strike', 'Manipulator Strike', 'Mechanical', 85, 100),
  ability: 'alienPhysiology',
  eligibility: "A stranded alien organism, cooperative now but violent when found, whose manipulators strike with great force.",
  dossier: {
    nickname: "An Old Castaway",
    authors: "Flah",
    images: [],
  },
} satisfies ScpDefinition
