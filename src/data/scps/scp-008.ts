import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-008',
  name: 'SCP-008',
  objectClass: 'Euclid',
  wave: 2,
  types: ['Biological'],
  stats: { template: 'physicalBruiser' },
  moves: ['infectious-bite', 'corrosive-touch', 'ambush', 'diagnose-pestilence'],
  signatureMove: phys('infectious-bite', 'Infectious Bite', 'Biological', 80, 100, [inflict('Bleeding', 30)]),
  ability: 'contagious',
  eligibility: 'A lethal prion whose reanimated hosts hunt and infect the living.',
  dossier: {
    nickname: 'Zombie Plague',
    authors: 'Unknown Author',
    images: [
      { file: 'scp-008.png', author: 'EstrellaYoshte', license: 'CC BY-SA 3.0', note: 'Derivative of "Protein BLMH PDB 1cb5" by Emw, CC BY-SA 3.0' },
    ],
    art: 'scp-008.png',
  },
} satisfies ScpDefinition
