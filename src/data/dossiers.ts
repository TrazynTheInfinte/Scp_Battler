import { SCPS } from './roster'

/**
 * Display and attribution data for each roster SCP, gathered from the SCP
 * files in scps/. All SCP-derived content is CC BY-SA 3.0 (see
 * CONTENT-LICENSE.md). Authors are copied from each article's "Licensing /
 * Citation" box.
 *
 * Images are only listed when the article's licensing box gives a license
 * compatible with reuse.
 */

export interface ImageCredit {
  /** Filename as listed on the article's licensing box. */
  file: string
  author: string
  license: string
  /** Extra attribution required, e.g. for derivative works. */
  note?: string
}

export interface Dossier {
  speciesId: string
  /** Community nickname, shown as a subtitle. Not from the article text. */
  nickname: string
  wikiUrl: string
  /** Exactly as credited on the article. */
  authors: string
  images: readonly ImageCredit[]
  /** The article has mature content: show a warning next to its link. */
  mature: boolean
}

export const DOSSIERS: Readonly<Record<string, Dossier>> = Object.fromEntries(
  SCPS.map((scp) => [
    scp.id,
    {
      speciesId: scp.id,
      nickname: scp.dossier.nickname,
      wikiUrl: scp.dossier.wikiUrl ?? `https://scp-wiki.wikidot.com/${scp.id}`,
      authors: scp.dossier.authors,
      images: scp.dossier.images,
      mature: scp.dossier.mature ?? false,
    },
  ]),
)

/**
 * Which licensed image (by its wiki filename) each SCP's art uses. SCPs not
 * listed have no licensed image and show a placeholder card.
 */
export const ART_SOURCE: Readonly<Record<string, string>> = Object.fromEntries(
  SCPS.flatMap((scp) => (scp.dossier.art ? [[scp.id, scp.dossier.art]] : [])),
)

/** The credit for the image an SCP's art shows, if any. */
export function artCredit(speciesId: string): ImageCredit | null {
  const file = ART_SOURCE[speciesId]
  if (!file) return null
  return DOSSIERS[speciesId]?.images.find((img) => img.file === file) ?? null
}
