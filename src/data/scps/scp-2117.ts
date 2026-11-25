import { spec } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-2117',
  name: 'SCP-2117',
  objectClass: 'Thaumiel',
  wave: 9,
  types: ['Mechanical', 'Temporal'],
  stats: { template: 'specialBruiser' },
  moves: ['wormhole-cannon', 'gear-grind', 'data-surge', 'negative-space'],
  signatureMove: spec('wormhole-cannon', 'Wormhole Cannon', 'Temporal', 90, 100),
  ability: 'shieldedHull',
  eligibility: "A vast, armed space station orbiting Titan, bigger inside than out, kept to fight threats from beyond the stars.",
  dossier: {
    nickname: "The Stolen Solidarity",
    authors: "Von Pincier and Anonymous",
    images: [],
  },
} satisfies ScpDefinition
