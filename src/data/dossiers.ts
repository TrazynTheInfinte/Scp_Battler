/**
 * Display and attribution data for each roster SCP. All SCP-derived content
 * is CC BY-SA 3.0 (see CONTENT-LICENSE.md). Authors are copied from each
 * article's "Licensing / Citation" box, verified 2026-11-19.
 *
 * Images are only listed when the article's licensing box gives a license
 * compatible with reuse. They are not bundled yet (milestone 6).
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
}

const wiki = (n: string) => `https://scp-wiki.wikidot.com/scp-${n}`

export const DOSSIERS: Readonly<Record<string, Dossier>> = Object.fromEntries(
  (
    [
      { speciesId: 'scp-999', nickname: 'The Tickle Monster', wikiUrl: wiki('999'), authors: 'ProfSnider', images: [] },
      {
        speciesId: 'scp-914', nickname: 'The Clockworks', wikiUrl: wiki('914'), authors: 'Dr Gears',
        images: [{ file: 'gears.jpg', author: 'Thomas Claveirole', license: 'CC BY-SA 2.0' }],
      },
      { speciesId: 'scp-343', nickname: '"God"', wikiUrl: wiki('343'), authors: 'Unknown Author', images: [] },
      {
        speciesId: 'scp-131', nickname: 'The "Eye Pods"', wikiUrl: wiki('131'), authors: 'Unknown Author',
        images: [{ file: '131volgun.png', author: 'VolgunStrife', license: 'CC BY-SA 3.0' }],
      },
      { speciesId: 'scp-173', nickname: 'The Sculpture', wikiUrl: wiki('173'), authors: 'Moto42', images: [] },
      { speciesId: 'scp-096', nickname: 'The "Shy Guy"', wikiUrl: wiki('096'), authors: 'Dr Dan', images: [] },
      {
        speciesId: 'scp-049', nickname: 'Plague Doctor', wikiUrl: wiki('049'),
        authors: 'Gabriel Jade, rewritten by djkaktus & Gabriel Jade',
        images: [
          { file: '049xray.jpg', author: 'Jadeitor', license: 'CC BY-SA 3.0' },
          { file: '049_1_ntsc.png', author: 'VolgunStrife', license: 'CC BY-SA 3.0' },
          { file: '049_2_ntsc.png', author: 'VolgunStrife', license: 'CC BY-SA 3.0' },
        ],
      },
      { speciesId: 'scp-079', nickname: 'Old AI', wikiUrl: wiki('079'), authors: 'Unknown Author', images: [] },
      { speciesId: 'scp-012', nickname: 'A Bad Composition', wikiUrl: wiki('012'), authors: 'ITIFAMCO', images: [] },
      {
        speciesId: 'scp-682', nickname: 'Hard-to-Destroy Reptile', wikiUrl: wiki('682'),
        authors: 'Dr Gears and Epic Phail Spy',
        images: [
          {
            file: 'monster8editub9-new.jpg', author: 'OccultistMave', license: 'CC BY-SA 3.0',
            note: 'Derivative of "Beached humpback whale at Kincaid Park. Anchorage, Alaska" by Paxson Woelber, CC BY 2.0',
          },
        ],
      },
      {
        speciesId: 'scp-106', nickname: 'The Old Man', wikiUrl: wiki('106'), authors: 'Dr Gears',
        images: [
          { file: '106emergenceklay.jpg', author: 'Klay Abele (MrKlay)', license: 'CC BY-SA 3.0' },
          { file: '106door.png', author: 'Cinemamind', license: 'CC BY-SA 3.0' },
          { file: '106victimresize.png', author: 'Cinemamind', license: 'CC BY-SA 3.0' },
        ],
      },
      { speciesId: 'scp-055', nickname: '[unknown]', wikiUrl: wiki('055'), authors: 'qntm and CptBellman', images: [] },
    ] satisfies Dossier[]
  ).map((d) => [d.speciesId, d]),
)
