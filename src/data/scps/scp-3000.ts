import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-3000',
  name: 'SCP-3000',
  objectClass: 'Thaumiel',
  wave: 2,
  types: ['Biological', 'Antimemetic'],
  stats: { template: 'wall' },
  moves: ['devour', 'memory-hole', 'erasure', 'regenerate'],
  signatureMove: phys('devour', 'Devour', 'Biological', 90, 100),
  ability: 'y909',
  eligibility: 'A colossal serpent that devours people and erases memories.',
  dossier: {
    nickname: 'Anantashesha',
    authors: 'A Random Day, djkaktus, and Joreth',
    images: [
      { file: 'warning.png', author: 'djkaktus', license: 'CC BY-SA 3.0' },
      { file: 'warning2.png', author: 'djkaktus', license: 'CC BY-SA 3.0' },
      { file: 'gaslight.png', author: 'djkaktus, Jens Petersen, and Bernard DUPONT', license: 'CC BY-SA 3.0', note: 'Uses "Gymnothorax fimbriatus.JPG" by Jens Petersen, CC BY-SA 3.0, and "Long-nosed Tree Snake (Ahaetulla nasuta)" by Bernard DUPONT, CC BY-SA 2.0' },
      { file: 'submarine.jpg', author: 'Kevin H. Tierney and ed g2s', license: 'Public Domain' },
      { file: 'krishnamoorthy.png', author: 'Lha Socialwork', license: 'Public Domain' },
    ],
    art: 'gaslight.png',
  },
} satisfies ScpDefinition
