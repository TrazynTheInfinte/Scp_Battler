import { spec, foe } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-244',
  name: 'SCP-244',
  objectClass: 'Euclid',
  wave: 12,
  types: ['Thaumic', 'Antimemetic'],
  stats: { template: 'slowSpecial' },
  moves: ['ice-fog', 'obscure', 'decay', 'calming-ooze'],
  moveNames: { obscure: 'Whiteout', decay: 'Frostbite', 'calming-ooze': 'Numbing Cold' },
  signatureMove: spec('ice-fog', 'Ice Fog', 'Thaumic', 80, 100, [foe({ spe: -1 }, 30)]),
  ability: 'freezingFog',
  eligibility: "A jar that pours out ice fog at −37 °C until the whole room freezes.",
  dossier: {
    nickname: "Ice Fog Jar",
    authors: "MalcolmMacLean",
    images: [],
  },
} satisfies ScpDefinition
