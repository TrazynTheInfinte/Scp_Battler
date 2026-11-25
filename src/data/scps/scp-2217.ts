import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-2217',
  name: 'SCP-2217',
  objectClass: 'Thaumiel',
  wave: 9,
  types: ['Kinetic', 'Mechanical'],
  stats: { template: 'specialBruiser' },
  moves: ['fulgurite-strike', 'gear-grind', 'data-surge', 'smite'],
  signatureMove: spec('fulgurite-strike', 'Fulgurite Strike', 'Kinetic', 90, 100, [inflict('Stunned', 20)]),
  ability: 'purifyingLightning',
  eligibility: "A beach of lightning and fulgurite machines whose discharge burned out the Flesh that Hates for miles.",
  dossier: {
    nickname: "Hammer and Anvil",
    authors: "Anonymous",
    images: [],
  },
} satisfies ScpDefinition
