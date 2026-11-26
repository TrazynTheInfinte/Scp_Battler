import { spec, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-460',
  name: 'SCP-460',
  objectClass: 'Euclid',
  wave: 16,
  types: ['Antimemetic', 'Thaumic'],
  stats: { template: 'slowSpecial' },
  moves: ['ghost-gale', 'overcharge', 'memory-hole', 'obscure'],
  moveNames: { overcharge: 'Gathering Storm', 'memory-hole': 'Lost Voices', obscure: 'Storm Cloud' },
  signatureMove: spec('ghost-gale', 'Ghost Gale', 'Antimemetic', 80, 100, [inflict('Amnesiac', 30)]),
  ability: 'seanceVoices',
  eligibility: "A ring of storm cloud kilometres wide, carrying the voices of the dead.",
  dossier: {
    nickname: "Séance Storm",
    authors: "Dr Kondraki",
    images: [],
  },
} satisfies ScpDefinition
