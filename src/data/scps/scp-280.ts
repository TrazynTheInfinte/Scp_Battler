import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-280',
  name: 'SCP-280',
  objectClass: 'Keter',
  wave: 13,
  types: ['Antimemetic', 'Reality'],
  stats: { template: 'fastPhysical' },
  moves: ['steel-tearing-grip', 'blink', 'unmake', 'ambush'],
  moveNames: { blink: 'Fade to Smoke', unmake: 'Pull Apart', ambush: 'From the Dark' },
  signatureMove: phys('steel-tearing-grip', 'Steel-Tearing Grip', 'Reality', 90, 100),
  ability: 'lightsOut',
  eligibility: "A smoke-black shape with long fingers that drifts toward people in the dark and pulls steel apart.",
  dossier: {
    nickname: "Eyes in the Dark",
    authors: "Dr Gears",
    images: [],
  },
} satisfies ScpDefinition
