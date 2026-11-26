import { phys, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-339',
  name: 'SCP-339',
  objectClass: 'Keter',
  wave: 14,
  types: ['Mechanical', 'Antimemetic'],
  stats: { template: 'armoredStriker' },
  moves: ['pulverize', 'corrosive-touch', 'rend', 'negative-space'],
  moveNames: { 'corrosive-touch': 'Grinding Tendrils', rend: 'Copper Lash', 'negative-space': 'Dead Silence' },
  signatureMove: phys('pulverize', 'Pulverize', 'Mechanical', 90, 100, [foe({ def: -1 }, 30)]),
  ability: 'noiseProvokesIt',
  eligibility: "Copper tendrils that grind any container to dust and turn violent at the faintest sound.",
  dossier: {
    nickname: "Be Silent, Be Still",
    authors: "Dr Blank",
    images: [],
  },
} satisfies ScpDefinition
