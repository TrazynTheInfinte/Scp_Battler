import { status, heal, cure } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-2000',
  name: 'SCP-2000',
  objectClass: 'Thaumiel',
  wave: 2,
  types: ['Mechanical', 'Temporal'],
  stats: { template: 'support' },
  moves: ['procedure-lazarus', 'data-surge', 'decay', 'coarse'],
  moveNames: { coarse: 'Bunker Seal' },
  signatureMove: status('procedure-lazarus', 'Procedure Lazarus', 'Temporal', null, [heal(25), cure]),
  ability: 'failsafe',
  eligibility: 'A machine that can reset history and rebuild what was lost.',
  dossier: {
    nickname: 'Deus Ex Machina',
    authors: 'HammerMaiden',
    images: [
      { file: 'Remember_Us.jpg', author: 'Colin Grice (HammerMaiden)', license: 'CC BY-SA 3.0', note: 'Derivative of "Desolate track on Lealholm moor" by Colin Grice, CC BY-SA 2.0' },
    ],
    art: 'Remember_Us.jpg',
  },
} satisfies ScpDefinition
