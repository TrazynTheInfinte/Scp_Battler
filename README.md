# SCP Battler

A turn-based, Pokémon-style battler themed on the SCP Foundation. Build a team
of four SCPs within a containment budget and battle an AI opponent in your
browser — phone or desktop.

## Development

```sh
npm install
npm run dev        # local dev server
npm run typecheck  # tsc -b (app, engine, and config projects)
npm run lint       # oxlint
npm test           # vitest
npm run build      # production build to dist/
```

Pushing to `main` runs the same checks in GitHub Actions and deploys to GitHub
Pages.

## Project layout

- `src/engine/` — the battle engine: pure, deterministic TypeScript with no
  DOM access (enforced by `tsconfig.engine.json`). See `docs/adr/0001`.
- `src/` — the React UI.
- `GLOSSARY.md` — the project's domain vocabulary.
- `docs/adr/` — architecture decision records.

## License

Code: MIT (`LICENSE`). SCP-derived content: CC BY-SA 3.0
(`CONTENT-LICENSE.md`). This project is not affiliated with the SCP Wiki.
