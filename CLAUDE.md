# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

M-Sewa is an eSewa (digital wallet) clone in a Turborepo + pnpm monorepo (Node >=24, pnpm 11). It is at an early stage: the API only has the scaffolded controller and a `User` model.

- `apps/api` — NestJS 12 backend (ESM, Prisma 7 + PostgreSQL, Vitest, oxlint)
- `apps/web` — Next.js 16 / React 19 / Tailwind 4 frontend (dev server on port **3001**)
- `packages/ui` — shared React components (`@repo/ui`)
- `packages/{eslint-config,typescript-config,tailwind-config}` — shared configs

The root `README.md` and `apps/web/README.md` are largely leftover from the Turborepo template; `apps/api/README.md` is the stock NestJS one.

## Commands

Run from the repo root (Turbo fans out to all workspaces):

```bash
pnpm dev              # turbo run dev (api watch + web + ui watchers)
pnpm build
pnpm lint
pnpm check-types
pnpm format           # prettier on **/*.{ts,tsx,md}
```

Target a single workspace with `pnpm --filter api <script>` / `pnpm --filter web <script>`, or run from inside the app directory.

### API (`apps/api`)

```bash
pnpm test                          # vitest run (unit: **/*.spec.ts)
pnpm vitest run src/app.controller.spec.ts   # single test file
pnpm vitest run -t "name"          # single test by name
pnpm test:e2e                      # uses vitest.config.e2e.ts (**/*.e2e-spec.ts, in test/)
pnpm lint                          # oxlint src/ test/ (not eslint)
pnpm exec prisma migrate dev       # create/apply migration
pnpm exec prisma generate          # regenerate client into src/generated/prisma
```

The API has no `check-types` script, so `pnpm check-types` at the root only covers web/ui.

## API architecture

- **ESM with `nodenext` resolution**: all relative imports must include the `.js` extension (e.g. `import { AppService } from './app.service.js'`), even though the sources are `.ts`. `main.ts` uses top-level `await`.
- **Prisma 7 driver-adapter setup**: `PrismaService` (`src/prisma/prisma.service.ts`) extends the generated `PrismaClient` and passes a `PrismaPg` adapter built from `process.env.DATABASE_URL`. `PrismaModule` exports it; import `PrismaModule` in any feature module that needs DB access. Connect/disconnect happen in the Nest lifecycle hooks.
- **Generated client is committed**: `schema.prisma` outputs to `src/generated/prisma` (tracked in git, imported as `../generated/prisma/client.js`). After editing `prisma/schema.prisma`, run `prisma migrate dev` / `prisma generate` and commit the regenerated files. Don't hand-edit them.
- **Connection config**: `prisma.config.ts` reads `DATABASE_URL` via `dotenv`; `.env` is gitignored and `env.example` shows the shape (`DATABASE_URL` is composed from the `DB_*` vars). Note `env.example` still has values from another project (`rahat-*`).
- `postinstall` runs `prisma skills sync`, which populates `.agents/`, `.claude/`, `.cursor/`, `.devin/` skill folders under `apps/api` — these are generated Prisma agent skills, not project code.
- The Prisma schema targets `linux-musl-openssl-3.0.x` in addition to `native` (for Alpine/Docker deploys).

## Web / UI architecture

- `packages/ui` is compiled: `build:styles` (tailwindcss CLI → `dist/index.css`) and `build:components` (`tsc` → `dist/*.js`) must run before `web` can consume it — `turbo.json` wires `build` accordingly, and `dev` runs both watchers alongside `web`. Its package exports point at `dist/`, so import as `@repo/ui/card` and `@repo/ui/styles.css`.
- `ui` Tailwind classes use a `ui-` prefix (see `packages/ui/src/styles.css`) to avoid collisions with app classes; shared theme lives in `packages/tailwind-config/shared-styles.css`.
- `apps/web/next.config.ts` sets `typescript.ignoreBuildErrors: true`, so `next build` will not catch type errors — run `pnpm check-types` (`next typegen && tsc --noEmit`) separately. ESLint runs with `--max-warnings 0`.
- The web app uses the App Router under `apps/web/app/`.
