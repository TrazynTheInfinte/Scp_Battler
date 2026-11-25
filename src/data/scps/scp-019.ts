import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-019',
  name: 'SCP-019',
  objectClass: 'Keter',
  wave: 3,
  types: ['Mechanical', 'Thaumic'],
  stats: { template: 'wall' },
  moves: ['swarm-release', 'roll-out', 'coarse', 'gear-grind'],
  moveNames: { 'roll-out': 'Lid Slam', coarse: 'Cast-Iron Body', 'gear-grind': 'Bubbling Brew' },
  signatureMove: phys('swarm-release', 'Swarm Release', 'Thaumic', 75, 100, [inflict('Bleeding', 20)]),
  ability: 'endlessBrood',
  eligibility: "An unbreakable vase that keeps releasing hostile creatures that bite and claw, in floods if disturbed.",
  dossier: {
    nickname: 'The Monster Pot',
    authors: 'Sophia Light',
    images: [],
  },
} satisfies ScpDefinition
