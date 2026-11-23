import type { MoveData, ObjectClass, SpeciesData, Stats } from '../engine'
import type { ImageCredit } from './dossiers'
import type { StatTemplateId } from './statTemplates'

/** How an SCP's base stats are set: a stat template scaled to the class total, with small tweaks that net to 0. */
export interface StatSpec {
  template: StatTemplateId
  tweaks?: Partial<Stats>
}

/**
 * Everything about one roster SCP, in one file under scps/ (named after its
 * id). The roster picks these files up automatically; scps.test.ts validates
 * each one.
 */
export interface ScpDefinition {
  /** e.g. 'scp-173'; the file must be named `<id>.ts`. */
  id: string
  /** e.g. 'SCP-173'. */
  name: string
  objectClass: ObjectClass
  /** The Wave (see GLOSSARY.md) it joined in; the balance test focuses on the newest. */
  wave: number
  types: SpeciesData['types']
  stats: StatSpec
  /** Four distinct move ids: Move Pool moves, plus the signature move's id if it has one. */
  moves: SpeciesData['moves']
  /** Its one Signature Move (see GLOSSARY.md), if any. */
  signatureMove?: MoveData
  /** Id of an ability in abilities.ts. */
  ability: string
  /** Why it meets the Eligibility rule (see GLOSSARY.md): how it would fight. */
  eligibility: string
  dossier: {
    /** Community nickname, shown as a subtitle. Not from the article text. */
    nickname: string
    /** Exactly as credited on the article's licensing box. */
    authors: string
    /** Defaults to https://scp-wiki.wikidot.com/<id>. */
    wikiUrl?: string
    /** Images whose licensing box allows reuse. */
    images: readonly ImageCredit[]
    /** Which of `images` (by filename) the game shows, resized to public/scp/<id>.jpg. */
    art?: string
  }
}
