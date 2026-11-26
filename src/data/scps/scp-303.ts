import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-303',
  name: 'SCP-303',
  objectClass: 'Euclid',
  wave: 13,
  types: ['Reality', 'Temporal'],
  stats: { template: 'fastPhysical' },
  moves: ['behind-the-door', 'crushing-jaws', 'blink', 'relentless-pursuit'],
  moveNames: { 'crushing-jaws': 'Oversized Teeth', blink: 'Next Door Over', 'relentless-pursuit': 'Wheezing Pursuit' },
  signatureMove: phys('behind-the-door', 'Behind the Door', 'Reality', 80, 100),
  ability: 'alwaysBehindYou',
  eligibility: "A wheezing, huge-mouthed figure that appears behind whatever closed door you are facing.",
  dossier: {
    nickname: "The Doorman",
    authors: "AJAlkaline",
    images: [],
  },
} satisfies ScpDefinition
