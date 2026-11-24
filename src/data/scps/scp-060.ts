import { phys, inflict } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-060',
  name: 'SCP-060',
  objectClass: 'Keter',
  wave: 4,
  types: ['Thaumic'],
  stats: { template: 'fastPhysical' },
  moves: ['hellfire-grapple', 'rend', 'flank', 'stalk'],
  signatureMove: phys('hellfire-grapple', 'Hellfire Grapple', 'Thaumic', 80, 100, [inflict('Bleeding', 30)]),
  ability: 'burningBody',
  eligibility: "A burning skeleton that runs down, leaps on, and strangles anyone near its grove.",
  dossier: {
    nickname: "Infernal Occult Skeleton",
    authors: "Dexanote",
    images: [],
  },
} satisfies ScpDefinition
