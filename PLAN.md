# SportVerse — execution plan

This plan implements [SportVerse_PRD.md](SportVerse_PRD.md). Treat the PRD as the source of truth for architecture, schema, and routes; treat the documents below as **mandatory design inputs** before writing UI.

---

## Design inputs (read first)

| Input | Path | Use |
|---|---|---|
| Creative direction | [DESIGN.md](DESIGN.md) | Tokens, typography, surfaces, “no-line” rule, glass/gradient — **primary** spec. |
| Stitch mockups (HTML) | [stitch_project_placeholder_title/](stitch_project_placeholder_title/) | Reference layouts for implementation and visual parity. |
| Cricket hub mock | [stitch_project_placeholder_title/cricket_hub/code.html](stitch_project_placeholder_title/cricket_hub/code.html) | `/[sport]` hub. |
| Player profile mock | [stitch_project_placeholder_title/player_profile_tennis_star/player_profile_tennis_star-code.html](stitch_project_placeholder_title/player_profile_tennis_star/player_profile_tennis_star-code.html) | `/[sport]/players/[slug]`. |
| E-sports PDP mock | [stitch_project_placeholder_title/e_sports_gear_pdp/e_sports_gear_pdp-code.html](stitch_project_placeholder_title/e_sports_gear_pdp/e_sports_gear_pdp-code.html) | `/shop/[slug]` (or sport-scoped product route per PRD). |
| Shop mock | [stitch_project_placeholder_title/sportverse_shop/shop_code.html](stitch_project_placeholder_title/sportverse_shop/shop_code.html) | `/shop/*` listing patterns. |
| Stitch-side design copy | [stitch_project_placeholder_title/stitch_dynamic/DESIGN.md](stitch_project_placeholder_title/stitch_dynamic/DESIGN.md) | Convenience copy of Kinetic Stadium; if conflict, follow root [DESIGN.md](DESIGN.md). |

**Workflow:** Define or update `apps/web` globals and Tailwind v4 `@theme` from **DESIGN.md**, then build each route against the matching **Stitch** HTML file (structure, spacing, hierarchy — not necessarily copy-pasting markup).

---

## Phase 0 — Monorepo bootstrap

- pnpm (or npm/yarn) workspaces at repo root: `apps/web`, `apps/studio`; optional `packages/*` later.
- Root scripts: `dev` (parallel Studio + web), `lint`, `typecheck`.
- `.env.example` documenting Sanity and webhook secrets (see PRD §10).

## Phase 1 — Sanity Studio (`apps/studio`)

- Point `sanity.cli` / config at project `xqsr0go8`, dataset `production` (PRD project details).
- Implement schema from PRD §4 (objects first, then documents, `schemaTypes` index §4.3).
- Desk structure per Appendix A (sport-first).
- `sanity schema deploy` when ready; seed minimal `sport` documents for dev.

## Phase 2 — Next.js app shell (`apps/web`)

- Next.js 15 App Router, Tailwind v4, `globals.css` with tokens aligned to **DESIGN.md** and PRD §6.4.
- `sanity` client + `next-sanity` image URL helper; no Studio inside `apps/web`.
- Middleware stub (PRD §7.2) optional in this phase.

## Phase 3 — Routes and data (MVP vertical slice)

- Create route tree per PRD §6.1; wire **sport hub** using PRD §5.1 GROQ and **cricket_hub** Stitch mock.
- **Player profile** using §5.2 + **player_profile_tennis_star** mock.
- **Shop** listing + **product** detail using §5.3 + **sportverse_shop** and **e_sports_gear_pdp** mocks.
- Apply ISR/revalidate intervals from PRD §2.3 per route.

## Phase 4 — Revalidation and preview

- Implement `app/api/revalidate/route.ts` per PRD §6.5; configure Sanity webhook to deployed `apps/web` URL (PRD §10.0).
- Optional: Presentation tool / preview draft mode per Sanity + Next patterns.

## Phase 5 — Integrations (defer until MVP pages ship)

- Algolia: PRD §8 (index shape, proxy route, federated search UI).
- AI enrichment: PRD §9 (webhook → worker → patch `contentContext`).
- Commerce: Shopify/Stripe per PRD; placeholder until APIs exist.
- Feature flags / Edge Config / LaunchDarkly: PRD §2.1 — stub or env-based flags initially.

## Phase 6 — Hardening

- Vercel project root `apps/web`, `vercel.json` in package (PRD §10.1).
- `sanity deploy` from `apps/studio`.
- Performance checks vs PRD §10.3; a11y pass using **DESIGN.md** ghost-outline rule.

---

## Traceability

| PRD section | Design tie-in |
|---|---|
| §6.1 routes | Map each major template to a file under **stitch_project_placeholder_title/** |
| §6.4 tokens | **DESIGN.md** overrides generic Stitch palette where they differ |
| §6.3 component map | Name and split components to match mock sections (hero, shelves, nav) |

When the PRD and **DESIGN.md** disagree, update the PRD in a follow-up PR after design sign-off; until then, **DESIGN.md** wins for visual design.
