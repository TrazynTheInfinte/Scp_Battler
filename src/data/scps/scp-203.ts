import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-203',
  name: 'SCP-203',
  objectClass: 'Euclid',
  wave: 7,
  types: ['Memetic', 'Thaumic'],
  stats: { template: 'mixedAttacker' },
  moves: ['iron-drone', 'rend', 'blood-ink', 'weep'],
  signatureMove: spec('iron-drone', 'Iron Drone', 'Memetic', 90, 90, [inflict('Stunned', 20)]),
  ability: 'deathDrone',
  eligibility: "A cast-iron humanoid with barbed fingers whose drone causes fatal brain hemorrhages.",
  dossier: {
    nickname: "Tortured Iron Soul",
    authors: "Chungy McBungy",
    images: [],
  },
} satisfies ScpDefinition
