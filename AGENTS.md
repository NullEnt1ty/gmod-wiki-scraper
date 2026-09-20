# GMod Wiki Scraper

TypeScript ESM library and CLI that extracts Garry's Mod wiki markup into JSON documentation.

## Structure

- `src/wiki-api-client.ts` owns requests to the Facepunch wiki API and normalizes page paths.
- `src/wiki-scraper.ts` fetches categories and parses wiki markup; `src/cheerio.ts` contains Cheerio guards.
- `src/types.ts` defines the exported JSON schema.
- `src/cli.ts` writes complete scrapes to `output/`. Treat `output/` and `dist/` as generated artifacts.
- Unit tests live beside their implementation in `src/*.test.ts`.

## Conventions

- Keep runtime TypeScript imports ESM-compatible with `.js` specifiers.
- Format TypeScript and JSON with Prettier's tab indentation.
- Add parser fixtures and assertions for markup variations; retain the raw wiki tags in descriptions unless the parser intentionally transforms them.

## Verification

- Build changes with `npm run build`.
- `npm test` includes live requests in `src/wiki-api-client.test.ts`; run it with network access and treat upstream wiki changes as external failures.

## Agent skills

### Issue tracker

Issues and specs live in GitHub Issues for `NullEnt1ty/gmod-wiki-scraper`; use the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context domain documentation uses root `CONTEXT.md` and `docs/adr/`. See `docs/agents/domain.md`.
