import { phys } from '../moves'
import type { ScpDefinition } from '../scp'

export default {
  id: 'scp-7606',
  name: 'SCP-7606',
  objectClass: 'Apollyon',
  wave: 8,
  types: ['Thaumic', 'Kinetic'],
  stats: { template: 'fastPhysical' },
  moves: ['manifest-arsenal', 'ambush', 'rend', 'flank'],
  moveNames: { ambush: 'Martial Arts', rend: 'Divine Blade', flank: 'Fire and Darkness' },
  signatureMove: phys('manifest-arsenal', 'Manifest Arsenal', 'Kinetic', 95, 100),
  ability: 'invincible',
  eligibility: "A self-declared god who conjures weapons, fights hand to hand, and commands fire, darkness and death.",
  dossier: {
    nickname: "The Invincible, Undefeated One",
    authors: "J T K C",
    images: [],
  },
} satisfies ScpDefinition
