import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-049',
  name: 'SCP-049',
  objectClass: 'Euclid',
  types: ['Biological', 'Thaumic'],
  // Pre-template stats, to be fitted to a stat template.
  stats: { legacy: { hp: 90, atk: 95, def: 80, spa: 75, spd: 90, spe: 45 } },
  moves: ['diagnose-pestilence', 'the-cure', 'bone-saw', 'sedative'],
  signatureMove: phys('the-cure', 'The Cure', 'Biological', 85, 100),
  ability: 'theCure',
  eligibility: 'A hostile humanoid that kills with a touch.',
  dossier: {
    nickname: 'Plague Doctor',
    authors: 'Gabriel Jade, rewritten by djkaktus & Gabriel Jade',
    images: [
      { file: '049xray.jpg', author: 'Jadeitor', license: 'CC BY-SA 3.0' },
      { file: '049_1_ntsc.png', author: 'VolgunStrife', license: 'CC BY-SA 3.0' },
      { file: '049_2_ntsc.png', author: 'VolgunStrife', license: 'CC BY-SA 3.0' },
    ],
    art: '049_1_ntsc.png',
  },
} satisfies ScpDefinition
