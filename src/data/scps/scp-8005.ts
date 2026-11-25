import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-8005',
  name: 'SCP-8005',
  objectClass: 'Thaumiel',
  wave: 9,
  types: ['Mechanical', 'Temporal'],
  stats: { template: 'wall' },
  moves: ['dead-mans-switch', 'roll-out', 'corrosive-touch', 'ram'],
  moveNames: { 'roll-out': 'Tiny Tumble', 'corrosive-touch': 'Clockwork Tick', ram: 'Dense Body Slam' },
  signatureMove: phys('dead-mans-switch', "Dead Man's Switch", 'Mechanical', 80, 100),
  ability: 'selfRepairingBody',
  eligibility: "Hammie, a tiny, impossibly dense, self-repairing robot with a clockwork dead-man's switch, kept as a last resort.",
  dossier: {
    nickname: "The Fool",
    authors: "daveyoufool",
    images: [],
  },
} satisfies ScpDefinition
