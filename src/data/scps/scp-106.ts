import { status, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-106',
  name: 'SCP-106',
  objectClass: 'Keter',
  wave: 1,
  types: ['Temporal', 'Thaumic'],
  // Pre-template stats, to be fitted to a stat template.
  stats: { legacy: { hp: 110, atk: 110, def: 100, spa: 100, spd: 100, spe: 80 } },
  moves: ['corrosive-touch', 'decay', 'ambush', 'into-the-pocket'],
  signatureMove: status('into-the-pocket', 'Into the Pocket', 'Thaumic', 90, [inflict('Contained')]),
  ability: 'phasing',
  eligibility: 'A hostile entity that corrodes matter and traps victims.',
  dossier: {
    nickname: 'The Old Man',
    authors: 'Dr Gears',
    images: [
      { file: '106emergenceklay.jpg', author: 'Klay Abele (MrKlay)', license: 'CC BY-SA 3.0' },
      { file: '106door.png', author: 'Cinemamind', license: 'CC BY-SA 3.0' },
      { file: '106victimresize.png', author: 'Cinemamind', license: 'CC BY-SA 3.0' },
    ],
    art: '106emergenceklay.jpg',
  },
} satisfies ScpDefinition
