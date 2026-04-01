# SportVerse — Multi-Sport Digital Platform PRD

## Product Requirements Document v1.0

**Classification:** Technical Architecture & Content Modeling Specification
**Stack:** Sanity CMS · Next.js 15 (App Router) · Tailwind CSS v4 · Vercel (monorepo: Studio and web app as separate packages)
**Design System:** Google Stitch-inspired token-driven UI — see **design references** below.

### Design references (canonical mockups and creative direction)

Implementation and visual QA must align with these sources (repo root, relative to this document):

| Asset | Path | Role |
|---|---|---|
| **Creative direction & UI rules** | [`DESIGN.md`](DESIGN.md) | North star (“The Kinetic Stadium”), palette, typography (Plus Jakarta Sans / Inter), surfaces, no-line rule, glass/gradient guidance — **authoritative** for tokens and composition. |
| **Stitch HTML mockups (Google Stitch)** | [`stitch_project_placeholder_title/`](stitch_project_placeholder_title/) | Page-level reference layouts to translate into Next.js + Tailwind; open in browser for structure, hierarchy, and motion intent. |
| **Cricket sport hub** | [`stitch_project_placeholder_title/cricket_hub/code.html`](stitch_project_placeholder_title/cricket_hub/code.html) | Hub / vertical landing reference. |
| **Tennis player profile** | [`stitch_project_placeholder_title/player_profile_tennis_star/player_profile_tennis_star-code.html`](stitch_project_placeholder_title/player_profile_tennis_star/player_profile_tennis_star-code.html) | Player profile reference. |
| **E-sports product (PDP)** | [`stitch_project_placeholder_title/e_sports_gear_pdp/e_sports_gear_pdp-code.html`](stitch_project_placeholder_title/e_sports_gear_pdp/e_sports_gear_pdp-code.html) | Product detail reference. |
| **Shop listing / commerce** | [`stitch_project_placeholder_title/sportverse_shop/shop_code.html`](stitch_project_placeholder_title/sportverse_shop/shop_code.html) | Shop / listing reference. |
| **Stitch folder design notes (duplicate)** | [`stitch_project_placeholder_title/stitch_dynamic/DESIGN.md`](stitch_project_placeholder_title/stitch_dynamic/DESIGN.md) | Same Kinetic Stadium spec as root `DESIGN.md`, kept next to Stitch exports for convenience; if copy drifts, **root [`DESIGN.md`](DESIGN.md) wins**. |

**Workflow:** Use [`DESIGN.md`](DESIGN.md) to define Tailwind v4 `@theme` tokens and global rules (§6.4); use each HTML file under **`stitch_project_placeholder_title/`** as the layout and component target when building the corresponding route (e.g. `/[sport]`, `/[sport]/players/[slug]`, `/shop/[slug]`).

### Project details (Sanity)

| Field | Value |
|---|---|
| **Project ID** | `xqsr0go8` |
| **Dataset** | `production` |
| **Org ID** | `ofsMxPwd5` |

---

## 1. Vision & Strategic Context

### 1.1 Product Vision

SportVerse is a content-first, commerce-enabled digital platform spanning multiple sports verticals — Cricket, Tennis, E-sports, and beyond. It unifies editorial storytelling, player/tournament data, and contextual product merchandising into a single composable architecture.

The platform treats **content as structured data, not pages** — every entity (player, tournament, product, sport) is a first-class citizen with rich relationships, enabling AI enrichment, cross-vertical recommendations, and personalized experiences at the edge.

### 1.2 Design Principles

| Principle | Implementation |
|---|---|
| **Entity-first modeling** | Content is modeled around domain entities (Sport, Player, Tournament), not around page layouts or URL structures. |
| **Composable relationships** | Every entity can reference any other entity. A Product references a Sport, a Player, and a Tournament — enabling contextual merchandising. |
| **AI-ready by default** | All content includes structured metadata fields (summaries, tags, embeddings slots) designed for LLM enrichment and vector search. |
| **Locale-aware, not locale-locked** | Internationalization is handled at the field level using Sanity's `@sanity/document-internationalization` pattern, not by duplicating documents. |
| **Edge-first rendering** | Next.js middleware + Vercel Edge Functions handle personalization, A/B testing, and geo-routing without sacrificing cache performance. |
| **Monorepo, split apps** | One repository with **separate packages** for Sanity Studio (`apps/studio`) and the Next.js frontend (`apps/web`); shared tooling at the root, independent deploy targets, Studio as the canonical home for schema. |

### 1.3 Target Verticals (Phase 1)

- **Cricket** — teams, squads, tournaments (IPL, World Cup), merchandise
- **Tennis** — individual players, Grand Slams, gear
- **E-sports** — teams/orgs, tournaments, gaming peripherals
- **Extensible** — the schema supports adding any sport via a `sport` document type

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      VERCEL EDGE                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ Middleware   │  │ Edge Config │  │ Feature Flags   │  │
│  │ (Geo/Auth)  │  │ (A/B Tests) │  │ (LaunchDarkly)  │  │
│  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘  │
│         └────────────────┼───────────────────┘           │
│                          ▼                               │
│  ┌───────────────────────────────────────────────────┐   │
│  │              NEXT.JS 15 (APP ROUTER)              │   │
│  │                                                   │   │
│  │  /[sport]              → Sport Hub (ISR 60s)      │   │
│  │  /[sport]/players/[slug] → Player Profile (ISR)   │   │
│  │  /[sport]/tournaments/[slug] → Tournament (ISR)   │   │
│  │  /[sport]/news/[slug]  → Article (SSR + stale)    │   │
│  │  /shop/[category]      → Product Listing (ISR)    │   │
│  │  /shop/[slug]          → Product Detail (ISR)     │   │
│  │  /api/revalidate       → On-demand ISR webhook    │   │
│  │  /api/search           → Algolia proxy            │   │
│  │  /api/recommendations  → ML inference endpoint    │   │
│  └───────────────────┬───────────────────────────────┘   │
└──────────────────────┼───────────────────────────────────┘
                       │
          ┌────────────┼─────────────┐
          ▼            ▼             ▼
   ┌────────────┐ ┌─────────┐ ┌──────────────┐
   │  SANITY    │ │ ALGOLIA │ │  COMMERCE    │
   │  Content   │ │ Search  │ │  ENGINE      │
   │  Lake      │ │ Index   │ │  (Shopify/   │
   │            │ │         │ │   Stripe)    │
   └────────────┘ └─────────┘ └──────────────┘
```

### 2.2 Data Flow

```
Content Author → Sanity Studio
                     │
                     ├──→ Webhook → Next.js on-demand revalidation
                     ├──→ Webhook → Algolia index sync
                     ├──→ Webhook → AI enrichment pipeline (summaries, tags, embeddings)
                     └──→ GROQ subscription → Real-time preview in Studio
```

### 2.3 Rendering Strategy by Route

| Route Pattern | Strategy | Revalidation | Rationale |
|---|---|---|---|
| `/[sport]` (hub) | ISR | 60s | High traffic, moderate change frequency |
| `/[sport]/players/[slug]` | ISR | 300s | Semi-static profile data |
| `/[sport]/tournaments/[slug]` | ISR + On-demand | 120s + webhook | Live scores need freshness |
| `/[sport]/news/[slug]` | SSR with `stale-while-revalidate` | On publish | Breaking news requires immediacy |
| `/shop/*` | ISR | 60s + webhook on price change | Balance freshness with performance |
| `/api/*` | Edge Runtime | N/A | Low latency for search/recs |

### 2.4 Monorepo repository layout

SportVerse is implemented as a **single git monorepo** with **Sanity Studio and the Next.js frontend in separate packages**. They share one repository and aligned versioning, but each has its own `package.json`, dependencies, and build or deploy entrypoint — no embedded Studio inside the web app’s `app/` tree.

**Required layout (conceptual):**

| Package | Path (convention) | Responsibility |
|---|---|---|
| **Frontend** | `apps/web` | Next.js 15 App Router site, API routes, Tailwind v4, Vercel deployment target |
| **Studio** | `apps/studio` | Sanity Studio, all schema (`defineType` / `defineField`), desk structure, Studio-only plugins |

**Tooling:** Use a workspace-capable package manager at the repo root (e.g. **pnpm** `pnpm-workspace.yaml`, or npm/yarn workspaces). Root scripts may orchestrate `dev` (parallel Studio + web), `lint`, and `typecheck` across packages.

**Shared code (optional):** A `packages/*` workspace (e.g. shared TypeScript types, GROQ query fragments, or constants) is allowed when it avoids coupling the Studio bundle to the web bundle or vice versa; keep shared packages dependency-light and framework-agnostic where possible.

**Anti-patterns:** Do not colocate Studio under `apps/web` (e.g. `app/studio` as the primary authoring surface) or merge schema into the frontend app as the canonical source — the Studio package remains the **source of truth** for content modeling and `sanity.config` / `sanity.cli`.

---

## 3. Content Model — Entity Relationship Design

### 3.1 Entity Relationship Diagram

```
                    ┌─────────────┐
                    │    SPORT    │
                    │             │
                    │ cricket     │
                    │ tennis      │
                    │ esports     │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
       ┌────────────┐ ┌─────────┐ ┌──────────┐
       │   PLAYER   │ │  TEAM   │ │TOURNAMENT│
       │            │ │         │ │          │
       │ bio, stats │ │ roster  │ │ schedule │
       │ career     │ │ history │ │ brackets │
       └──────┬─────┘ └────┬────┘ └─────┬────┘
              │            │            │
              │     ┌──────┴──────┐     │
              │     │             │     │
              ▼     ▼             ▼     ▼
           ┌──────────┐       ┌──────────┐
           │ ARTICLE  │       │ PRODUCT  │
           │          │       │          │
           │ editorial│       │ merch    │
           │ news     │       │ gear     │
           │ analysis │       │ apparel  │
           └──────────┘       └──────────┘
              │                     │
              └─────────┬───────────┘
                        ▼
                 ┌─────────────┐
                 │   CONTENT   │
                 │   CONTEXT   │
                 │             │
                 │ tags, AI    │
                 │ embeddings  │
                 │ locale      │
                 └─────────────┘
```

### 3.2 Core Entity Descriptions

| Entity | Type | Key Relationships | Notes |
|---|---|---|---|
| **Sport** | Document | → Players, Teams, Tournaments, Products, Articles | Top-level vertical container |
| **Player** | Document | → Sport, Team(s), Tournaments, Products (endorsements) | Supports individual + team-sport players |
| **Team** | Document | → Sport, Players (roster), Tournaments | Optional — omitted for individual sports |
| **Tournament** | Document | → Sport, Teams/Players, Venue, Products (sponsors) | Supports past (results) and upcoming (schedule) |
| **Article** | Document | → Sport, Players, Teams, Tournaments, Products | Editorial content with rich cross-references |
| **Product** | Document | → Sport, Players, Categories, Tournaments | Commerce entity with contextual links |
| **Venue** | Object | Embedded in Tournament | Reusable location object |
| **CareerEntry** | Object | Embedded in Player | Timeline of achievements |
| **ContentContext** | Object | Embedded in all documents | AI tags, embeddings slot, locale metadata |

---

## 4. Sanity Schema Design

All schema files, Studio configuration (`sanity.config.*`, `sanity.cli.*`), and desk structure described in this section live in the **`apps/studio`** package. File path comments below are relative to that package unless noted otherwise.

### 4.1 Shared Objects (Reusable Primitives)

```typescript
// === schemas/objects/localizedString.ts ===
// Field-level i18n: every translatable string uses this pattern
import { defineType } from 'sanity'

export const localizedString = defineType({
  name: 'localizedString',
  title: 'Localized String',
  type: 'object',
  fields: [
    { name: 'en', type: 'string', title: 'English' },
    { name: 'es', type: 'string', title: 'Spanish' },
    { name: 'hi', type: 'string', title: 'Hindi' },
    { name: 'ja', type: 'string', title: 'Japanese' },
  ],
  // Collapse in Studio to keep forms clean
  options: { collapsible: true, collapsed: true },
})
```

```typescript
// === schemas/objects/localizedBlockContent.ts ===
// Rich text with i18n support
import { defineType } from 'sanity'

export const localizedBlockContent = defineType({
  name: 'localizedBlockContent',
  title: 'Localized Rich Text',
  type: 'object',
  fields: [
    {
      name: 'en',
      title: 'English',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'Quote', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
              { title: 'Code', value: 'code' },
            ],
            annotations: [
              {
                name: 'internalLink',
                type: 'object',
                title: 'Internal Link',
                fields: [
                  {
                    name: 'reference',
                    type: 'reference',
                    to: [
                      { type: 'player' },
                      { type: 'team' },
                      { type: 'tournament' },
                      { type: 'product' },
                    ],
                  },
                ],
              },
              {
                name: 'externalLink',
                type: 'object',
                title: 'External Link',
                fields: [
                  { name: 'url', type: 'url', title: 'URL' },
                  { name: 'newTab', type: 'boolean', title: 'Open in new tab' },
                ],
              },
            ],
          },
        },
        { type: 'image', options: { hotspot: true } },
        { type: 'videoEmbed' },
        { type: 'dataTable' },
        { type: 'callout' },
      ],
    },
    // Additional locales follow the same structure
  ],
})
```

```typescript
// === schemas/objects/contentContext.ts ===
// AI-ready metadata object — embedded in every document
import { defineType } from 'sanity'

export const contentContext = defineType({
  name: 'contentContext',
  title: 'Content Context (AI & Personalization)',
  type: 'object',
  fields: [
    {
      name: 'aiSummary',
      title: 'AI-Generated Summary',
      type: 'text',
      rows: 3,
      description: 'Auto-populated by AI enrichment pipeline. Do not edit manually.',
      readOnly: true,
    },
    {
      name: 'aiTags',
      title: 'AI-Generated Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      readOnly: true,
    },
    {
      name: 'embeddingVector',
      title: 'Embedding Vector ID',
      type: 'string',
      description: 'Reference to vector store (Pinecone/Weaviate) embedding ID.',
      readOnly: true,
      hidden: true,
    },
    {
      name: 'manualTags',
      title: 'Editorial Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'Human-curated tags that supplement AI tags.',
    },
    {
      name: 'audiences',
      title: 'Target Audiences',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Casual Fan', value: 'casual' },
          { title: 'Hardcore Enthusiast', value: 'hardcore' },
          { title: 'Fantasy Player', value: 'fantasy' },
          { title: 'Collector', value: 'collector' },
          { title: 'Beginner', value: 'beginner' },
        ],
      },
    },
    {
      name: 'sentiment',
      title: 'Content Sentiment',
      type: 'string',
      options: {
        list: ['positive', 'neutral', 'negative', 'controversial'],
      },
      readOnly: true,
    },
  ],
  options: { collapsible: true, collapsed: true },
})
```

```typescript
// === schemas/objects/seo.ts ===
import { defineType } from 'sanity'

export const seo = defineType({
  name: 'seo',
  title: 'SEO & Open Graph',
  type: 'object',
  fields: [
    { name: 'metaTitle', type: 'localizedString', title: 'Meta Title' },
    { name: 'metaDescription', type: 'localizedString', title: 'Meta Description' },
    {
      name: 'ogImage',
      type: 'image',
      title: 'Open Graph Image',
      options: { hotspot: true },
    },
    { name: 'noIndex', type: 'boolean', title: 'No Index', initialValue: false },
    {
      name: 'canonicalUrl',
      type: 'url',
      title: 'Canonical URL',
      description: 'Only set if this content exists elsewhere.',
    },
    {
      name: 'structuredData',
      title: 'JSON-LD Override',
      type: 'text',
      description: 'Custom structured data (auto-generated if left blank).',
    },
  ],
  options: { collapsible: true, collapsed: true },
})
```

```typescript
// === schemas/objects/socialProfile.ts ===
import { defineType } from 'sanity'

export const socialProfile = defineType({
  name: 'socialProfile',
  title: 'Social Profile',
  type: 'object',
  fields: [
    {
      name: 'platform',
      type: 'string',
      options: {
        list: ['twitter', 'instagram', 'youtube', 'twitch', 'tiktok', 'linkedin'],
      },
    },
    { name: 'url', type: 'url', title: 'Profile URL' },
    { name: 'handle', type: 'string', title: 'Handle / Username' },
  ],
  preview: {
    select: { platform: 'platform', handle: 'handle' },
    prepare: ({ platform, handle }) => ({
      title: `${platform}: @${handle}`,
    }),
  },
})
```

### 4.2 Document Schemas — Core Entities

```typescript
// === schemas/documents/sport.ts ===
import { defineType, defineField } from 'sanity'

export const sport = defineType({
  name: 'sport',
  title: 'Sport',
  type: 'document',
  icon: () => '🏆',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'taxonomy', title: 'Taxonomy & Config' },
    { name: 'ai', title: 'AI & Personalization' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Sport Name',
      type: 'localizedString',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: { source: 'name.en', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Sport Icon',
      type: 'image',
      group: 'content',
      options: { hotspot: true },
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      group: 'content',
      options: { hotspot: true },
    }),
    defineField({
      name: 'overview',
      title: 'Overview',
      type: 'localizedBlockContent',
      group: 'content',
    }),
    defineField({
      name: 'history',
      title: 'History',
      type: 'localizedBlockContent',
      group: 'content',
    }),
    defineField({
      name: 'hasTeams',
      title: 'Team-based Sport?',
      type: 'boolean',
      group: 'taxonomy',
      initialValue: true,
      description: 'Toggle off for individual sports like Tennis.',
    }),
    defineField({
      name: 'statFields',
      title: 'Custom Stat Fields',
      type: 'array',
      group: 'taxonomy',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'key', type: 'string', title: 'Stat Key (e.g., "battingAverage")' },
            { name: 'label', type: 'localizedString', title: 'Display Label' },
            {
              name: 'type',
              type: 'string',
              options: { list: ['number', 'percentage', 'ratio', 'text'] },
            },
          ],
        },
      ],
      description:
        'Define sport-specific statistics. Players inherit these fields dynamically.',
    }),
    defineField({
      name: 'productCategories',
      title: 'Related Product Categories',
      type: 'array',
      group: 'taxonomy',
      of: [{ type: 'reference', to: [{ type: 'productCategory' }] }],
    }),
    defineField({ name: 'contentContext', type: 'contentContext', group: 'ai' }),
    defineField({ name: 'seo', type: 'seo', group: 'seo' }),
  ],
  preview: {
    select: { title: 'name.en', media: 'icon' },
  },
})
```

```typescript
// === schemas/documents/player.ts ===
import { defineType, defineField } from 'sanity'

export const player = defineType({
  name: 'player',
  title: 'Player',
  type: 'document',
  icon: () => '👤',
  groups: [
    { name: 'bio', title: 'Biography', default: true },
    { name: 'career', title: 'Career & Stats' },
    { name: 'connections', title: 'Relationships' },
    { name: 'commerce', title: 'Commerce' },
    { name: 'ai', title: 'AI & Personalization' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    // — Bio Group —
    defineField({
      name: 'name',
      title: 'Full Name',
      type: 'string',
      group: 'bio',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'bio',
      options: { source: 'name', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'nickname',
      title: 'Nickname / Gamertag',
      type: 'string',
      group: 'bio',
    }),
    defineField({
      name: 'portrait',
      title: 'Portrait',
      type: 'image',
      group: 'bio',
      options: { hotspot: true },
    }),
    defineField({
      name: 'nationality',
      title: 'Nationality',
      type: 'string',
      group: 'bio',
    }),
    defineField({
      name: 'dateOfBirth',
      title: 'Date of Birth',
      type: 'date',
      group: 'bio',
    }),
    defineField({
      name: 'bio',
      title: 'Biography',
      type: 'localizedBlockContent',
      group: 'bio',
    }),
    defineField({
      name: 'socialProfiles',
      title: 'Social Profiles',
      type: 'array',
      of: [{ type: 'socialProfile' }],
      group: 'bio',
    }),

    // — Career Group —
    defineField({
      name: 'sport',
      title: 'Primary Sport',
      type: 'reference',
      to: [{ type: 'sport' }],
      group: 'career',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'position',
      title: 'Position / Role',
      type: 'localizedString',
      group: 'career',
      description: 'e.g., "Opening Batsman", "Left Wing", "Support / IGL"',
    }),
    defineField({
      name: 'isActive',
      title: 'Currently Active',
      type: 'boolean',
      group: 'career',
      initialValue: true,
    }),
    defineField({
      name: 'careerTimeline',
      title: 'Career Timeline',
      type: 'array',
      group: 'career',
      of: [
        {
          type: 'object',
          name: 'careerEntry',
          fields: [
            { name: 'year', type: 'number', title: 'Year' },
            { name: 'title', type: 'localizedString', title: 'Title / Achievement' },
            { name: 'description', type: 'text', title: 'Description' },
            {
              name: 'team',
              type: 'reference',
              to: [{ type: 'team' }],
              title: 'Associated Team',
            },
            {
              name: 'tournament',
              type: 'reference',
              to: [{ type: 'tournament' }],
              title: 'Associated Tournament',
            },
          ],
          preview: {
            select: { year: 'year', title: 'title.en' },
            prepare: ({ year, title }) => ({ title: `${year} — ${title}` }),
          },
        },
      ],
      options: { sortable: true },
    }),
    defineField({
      name: 'stats',
      title: 'Player Statistics',
      type: 'array',
      group: 'career',
      of: [
        {
          type: 'object',
          name: 'stat',
          fields: [
            {
              name: 'key',
              type: 'string',
              title: 'Stat Key',
              description: 'Must match a statField key from the Sport document.',
            },
            { name: 'value', type: 'string', title: 'Value' },
          ],
        },
      ],
      description: 'Sport-specific stats. Keys must match those defined on the Sport.',
    }),

    // — Connections Group —
    defineField({
      name: 'currentTeam',
      title: 'Current Team',
      type: 'reference',
      to: [{ type: 'team' }],
      group: 'connections',
    }),
    defineField({
      name: 'pastTeams',
      title: 'Past Teams',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'team' }] }],
      group: 'connections',
    }),

    // — Commerce Group —
    defineField({
      name: 'endorsedProducts',
      title: 'Endorsed / Signature Products',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'product' }] }],
      group: 'commerce',
      description: 'Products this player endorses or has a signature line for.',
    }),
    defineField({
      name: 'equipment',
      title: 'Equipment Used',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'category',
              type: 'string',
              title: 'Category',
              description: 'e.g., "Bat", "Racket", "Mouse"',
            },
            {
              name: 'product',
              type: 'reference',
              to: [{ type: 'product' }],
              title: 'Product',
            },
          ],
        },
      ],
      group: 'commerce',
    }),

    defineField({ name: 'contentContext', type: 'contentContext', group: 'ai' }),
    defineField({ name: 'seo', type: 'seo', group: 'seo' }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'sport.name.en', media: 'portrait' },
  },
})
```

```typescript
// === schemas/documents/team.ts ===
import { defineType, defineField } from 'sanity'

export const team = defineType({
  name: 'team',
  title: 'Team',
  type: 'document',
  icon: () => '🛡️',
  groups: [
    { name: 'info', title: 'Team Info', default: true },
    { name: 'roster', title: 'Roster' },
    { name: 'ai', title: 'AI & Personalization' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Team Name',
      type: 'localizedString',
      group: 'info',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'info',
      options: { source: 'name.en', maxLength: 96 },
    }),
    defineField({
      name: 'sport',
      title: 'Sport',
      type: 'reference',
      to: [{ type: 'sport' }],
      group: 'info',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      group: 'info',
    }),
    defineField({
      name: 'founded',
      title: 'Year Founded',
      type: 'number',
      group: 'info',
    }),
    defineField({
      name: 'homeVenue',
      title: 'Home Venue',
      type: 'object',
      group: 'info',
      fields: [
        { name: 'name', type: 'string', title: 'Venue Name' },
        { name: 'city', type: 'string', title: 'City' },
        { name: 'country', type: 'string', title: 'Country' },
        {
          name: 'coordinates',
          type: 'geopoint',
          title: 'Coordinates',
        },
      ],
    }),
    defineField({
      name: 'description',
      title: 'Team Description',
      type: 'localizedBlockContent',
      group: 'info',
    }),

    // — Roster —
    defineField({
      name: 'roster',
      title: 'Current Roster',
      type: 'array',
      group: 'roster',
      of: [
        {
          type: 'object',
          name: 'rosterEntry',
          fields: [
            {
              name: 'player',
              type: 'reference',
              to: [{ type: 'player' }],
              title: 'Player',
            },
            { name: 'role', type: 'string', title: 'Role' },
            { name: 'jerseyNumber', type: 'number', title: 'Jersey #' },
            { name: 'joinDate', type: 'date', title: 'Joined' },
          ],
          preview: {
            select: { title: 'player.name', role: 'role', number: 'jerseyNumber' },
            prepare: ({ title, role, number }) => ({
              title: `#${number || '?'} ${title}`,
              subtitle: role,
            }),
          },
        },
      ],
    }),

    defineField({ name: 'contentContext', type: 'contentContext', group: 'ai' }),
    defineField({ name: 'seo', type: 'seo', group: 'seo' }),
  ],
  preview: {
    select: { title: 'name.en', subtitle: 'sport.name.en', media: 'logo' },
  },
})
```

```typescript
// === schemas/documents/tournament.ts ===
import { defineType, defineField } from 'sanity'

export const tournament = defineType({
  name: 'tournament',
  title: 'Tournament',
  type: 'document',
  icon: () => '🏅',
  groups: [
    { name: 'info', title: 'Info', default: true },
    { name: 'schedule', title: 'Schedule & Results' },
    { name: 'commerce', title: 'Commerce & Sponsors' },
    { name: 'ai', title: 'AI & Personalization' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Tournament Name',
      type: 'localizedString',
      group: 'info',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'info',
      options: { source: 'name.en', maxLength: 96 },
    }),
    defineField({
      name: 'sport',
      title: 'Sport',
      type: 'reference',
      to: [{ type: 'sport' }],
      group: 'info',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'edition',
      title: 'Edition / Year',
      type: 'string',
      group: 'info',
      description: 'e.g., "2025", "Season 14", "Roland Garros 2025"',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'info',
      options: {
        list: [
          { title: 'Upcoming', value: 'upcoming' },
          { title: 'Live', value: 'live' },
          { title: 'Completed', value: 'completed' },
          { title: 'Cancelled', value: 'cancelled' },
        ],
        layout: 'radio',
      },
      initialValue: 'upcoming',
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'datetime',
      group: 'info',
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'datetime',
      group: 'info',
    }),
    defineField({
      name: 'venue',
      title: 'Venue',
      type: 'object',
      group: 'info',
      fields: [
        { name: 'name', type: 'string', title: 'Venue Name' },
        { name: 'city', type: 'string', title: 'City' },
        { name: 'country', type: 'string', title: 'Country' },
        { name: 'coordinates', type: 'geopoint', title: 'Coordinates' },
      ],
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'localizedBlockContent',
      group: 'info',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      group: 'info',
      options: { hotspot: true },
    }),
    defineField({
      name: 'participants',
      title: 'Participating Teams / Players',
      type: 'array',
      group: 'schedule',
      of: [
        { type: 'reference', to: [{ type: 'team' }, { type: 'player' }] },
      ],
    }),
    defineField({
      name: 'schedule',
      title: 'Match Schedule',
      type: 'array',
      group: 'schedule',
      of: [
        {
          type: 'object',
          name: 'match',
          fields: [
            { name: 'title', type: 'string', title: 'Match Title' },
            { name: 'dateTime', type: 'datetime', title: 'Date & Time' },
            { name: 'stage', type: 'string', title: 'Stage (e.g., "Quarter-Final")' },
            {
              name: 'participants',
              type: 'array',
              of: [{ type: 'reference', to: [{ type: 'team' }, { type: 'player' }] }],
              title: 'Participants',
            },
            { name: 'result', type: 'string', title: 'Result' },
            {
              name: 'winner',
              type: 'reference',
              to: [{ type: 'team' }, { type: 'player' }],
              title: 'Winner',
            },
          ],
          preview: {
            select: { title: 'title', stage: 'stage', date: 'dateTime' },
            prepare: ({ title, stage, date }) => ({
              title: title,
              subtitle: `${stage} — ${date ? new Date(date).toLocaleDateString() : 'TBD'}`,
            }),
          },
        },
      ],
    }),
    defineField({
      name: 'winner',
      title: 'Tournament Winner',
      type: 'reference',
      to: [{ type: 'team' }, { type: 'player' }],
      group: 'schedule',
    }),

    // — Commerce —
    defineField({
      name: 'officialProducts',
      title: 'Official Merchandise',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'product' }] }],
      group: 'commerce',
    }),
    defineField({
      name: 'sponsors',
      title: 'Sponsors',
      type: 'array',
      group: 'commerce',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'name', type: 'string', title: 'Sponsor Name' },
            { name: 'logo', type: 'image', title: 'Logo' },
            { name: 'url', type: 'url', title: 'Website' },
            {
              name: 'tier',
              type: 'string',
              options: { list: ['title', 'gold', 'silver', 'bronze'] },
            },
          ],
        },
      ],
    }),

    defineField({ name: 'contentContext', type: 'contentContext', group: 'ai' }),
    defineField({ name: 'seo', type: 'seo', group: 'seo' }),
  ],
  orderings: [
    { title: 'Start Date (Newest)', name: 'startDateDesc', by: [{ field: 'startDate', direction: 'desc' }] },
  ],
  preview: {
    select: {
      title: 'name.en',
      subtitle: 'edition',
      status: 'status',
      media: 'coverImage',
    },
    prepare: ({ title, subtitle, status, media }) => ({
      title,
      subtitle: `${subtitle} [${status}]`,
      media,
    }),
  },
})
```

```typescript
// === schemas/documents/article.ts ===
import { defineType, defineField } from 'sanity'

export const article = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  icon: () => '📰',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'relations', title: 'Relationships' },
    { name: 'editorial', title: 'Editorial Workflow' },
    { name: 'ai', title: 'AI & Personalization' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localizedString',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: { source: 'title.en', maxLength: 200 },
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'localizedString',
      group: 'content',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      group: 'content',
      options: { hotspot: true },
      fields: [
        { name: 'alt', type: 'string', title: 'Alt Text' },
        { name: 'caption', type: 'string', title: 'Caption' },
        { name: 'credit', type: 'string', title: 'Credit' },
      ],
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'localizedBlockContent',
      group: 'content',
    }),
    defineField({
      name: 'articleType',
      title: 'Article Type',
      type: 'string',
      group: 'content',
      options: {
        list: [
          { title: 'News', value: 'news' },
          { title: 'Feature', value: 'feature' },
          { title: 'Analysis', value: 'analysis' },
          { title: 'Opinion', value: 'opinion' },
          { title: 'Interview', value: 'interview' },
          { title: 'Live Blog', value: 'liveblog' },
        ],
      },
    }),

    // — Relations —
    defineField({
      name: 'sport',
      title: 'Sport',
      type: 'reference',
      to: [{ type: 'sport' }],
      group: 'relations',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'relatedPlayers',
      title: 'Related Players',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'player' }] }],
      group: 'relations',
    }),
    defineField({
      name: 'relatedTeams',
      title: 'Related Teams',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'team' }] }],
      group: 'relations',
    }),
    defineField({
      name: 'relatedTournaments',
      title: 'Related Tournaments',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'tournament' }] }],
      group: 'relations',
    }),
    defineField({
      name: 'relatedProducts',
      title: 'Related Products',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'product' }] }],
      group: 'relations',
      description: 'Contextual product placements within the article.',
    }),

    // — Editorial —
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
      group: 'editorial',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      group: 'editorial',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'editorial',
      options: {
        list: ['draft', 'in-review', 'published', 'archived'],
        layout: 'radio',
      },
      initialValue: 'draft',
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured Article',
      type: 'boolean',
      group: 'editorial',
      initialValue: false,
    }),

    defineField({ name: 'contentContext', type: 'contentContext', group: 'ai' }),
    defineField({ name: 'seo', type: 'seo', group: 'seo' }),
  ],
  orderings: [
    {
      title: 'Published (Newest)',
      name: 'publishedDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title.en',
      type: 'articleType',
      date: 'publishedAt',
      media: 'heroImage',
    },
    prepare: ({ title, type, date, media }) => ({
      title,
      subtitle: `${type || 'article'} — ${date ? new Date(date).toLocaleDateString() : 'unpublished'}`,
      media,
    }),
  },
})
```

```typescript
// === schemas/documents/product.ts ===
import { defineType, defineField } from 'sanity'

export const product = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  icon: () => '🛍️',
  groups: [
    { name: 'info', title: 'Product Info', default: true },
    { name: 'pricing', title: 'Pricing & Variants' },
    { name: 'relations', title: 'Contextual Links' },
    { name: 'ai', title: 'AI & Personalization' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Product Name',
      type: 'localizedString',
      group: 'info',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'info',
      options: { source: 'name.en', maxLength: 200 },
    }),
    defineField({
      name: 'sku',
      title: 'SKU',
      type: 'string',
      group: 'info',
    }),
    defineField({
      name: 'externalId',
      title: 'External Commerce ID',
      type: 'string',
      group: 'info',
      description: 'Shopify product ID, Stripe price ID, etc.',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'localizedBlockContent',
      group: 'info',
    }),
    defineField({
      name: 'images',
      title: 'Product Images',
      type: 'array',
      group: 'info',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', type: 'string', title: 'Alt Text' },
          ],
        },
      ],
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'productCategory' }],
      group: 'info',
    }),

    // — Pricing —
    defineField({
      name: 'price',
      title: 'Base Price',
      type: 'object',
      group: 'pricing',
      fields: [
        { name: 'amount', type: 'number', title: 'Amount' },
        {
          name: 'currency',
          type: 'string',
          title: 'Currency',
          options: { list: ['USD', 'EUR', 'GBP', 'INR', 'JPY'] },
          initialValue: 'USD',
        },
      ],
    }),
    defineField({
      name: 'compareAtPrice',
      title: 'Compare-at Price',
      type: 'number',
      group: 'pricing',
      description: 'Strikethrough price for sales.',
    }),
    defineField({
      name: 'variants',
      title: 'Variants',
      type: 'array',
      group: 'pricing',
      of: [
        {
          type: 'object',
          name: 'productVariant',
          fields: [
            { name: 'name', type: 'string', title: 'Variant Name (e.g., "Size L")' },
            { name: 'sku', type: 'string', title: 'Variant SKU' },
            { name: 'price', type: 'number', title: 'Price Override' },
            { name: 'inStock', type: 'boolean', title: 'In Stock', initialValue: true },
            {
              name: 'attributes',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    { name: 'key', type: 'string', title: 'Attribute' },
                    { name: 'value', type: 'string', title: 'Value' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }),

    // — Contextual Relations —
    defineField({
      name: 'sports',
      title: 'Related Sports',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'sport' }] }],
      group: 'relations',
    }),
    defineField({
      name: 'endorsedBy',
      title: 'Endorsed By Players',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'player' }] }],
      group: 'relations',
    }),
    defineField({
      name: 'featuredInTournaments',
      title: 'Featured In Tournaments',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'tournament' }] }],
      group: 'relations',
    }),

    defineField({ name: 'contentContext', type: 'contentContext', group: 'ai' }),
    defineField({ name: 'seo', type: 'seo', group: 'seo' }),
  ],
  preview: {
    select: { title: 'name.en', price: 'price.amount', currency: 'price.currency', media: 'images.0' },
    prepare: ({ title, price, currency, media }) => ({
      title,
      subtitle: price ? `${currency} ${price}` : 'No price set',
      media,
    }),
  },
})
```

```typescript
// === schemas/documents/productCategory.ts ===
import { defineType, defineField } from 'sanity'

export const productCategory = defineType({
  name: 'productCategory',
  title: 'Product Category',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'localizedString', title: 'Name', validation: (Rule) => Rule.required() }),
    defineField({ name: 'slug', type: 'slug', title: 'Slug', options: { source: 'name.en' } }),
    defineField({ name: 'description', type: 'localizedString', title: 'Description' }),
    defineField({ name: 'icon', type: 'image', title: 'Icon' }),
    defineField({
      name: 'parent',
      type: 'reference',
      to: [{ type: 'productCategory' }],
      title: 'Parent Category',
      description: 'Supports nested category trees.',
    }),
  ],
  preview: {
    select: { title: 'name.en', parent: 'parent.name.en' },
    prepare: ({ title, parent }) => ({
      title: parent ? `${parent} → ${title}` : title,
    }),
  },
})
```

```typescript
// === schemas/documents/author.ts ===
import { defineType, defineField } from 'sanity'

export const author = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string', title: 'Name', validation: (Rule) => Rule.required() }),
    defineField({ name: 'slug', type: 'slug', title: 'Slug', options: { source: 'name' } }),
    defineField({ name: 'avatar', type: 'image', title: 'Avatar', options: { hotspot: true } }),
    defineField({ name: 'bio', type: 'text', title: 'Bio' }),
    defineField({ name: 'role', type: 'string', title: 'Role' }),
    defineField({
      name: 'socialProfiles',
      title: 'Social Profiles',
      type: 'array',
      of: [{ type: 'socialProfile' }],
    }),
  ],
})
```

### 4.3 Schema Index

```typescript
// === schemas/index.ts ===

// Objects
import { localizedString } from './objects/localizedString'
import { localizedBlockContent } from './objects/localizedBlockContent'
import { contentContext } from './objects/contentContext'
import { seo } from './objects/seo'
import { socialProfile } from './objects/socialProfile'

// Documents
import { sport } from './documents/sport'
import { player } from './documents/player'
import { team } from './documents/team'
import { tournament } from './documents/tournament'
import { article } from './documents/article'
import { product } from './documents/product'
import { productCategory } from './documents/productCategory'
import { author } from './documents/author'

export const schemaTypes = [
  // Objects (register first — documents depend on them)
  localizedString,
  localizedBlockContent,
  contentContext,
  seo,
  socialProfile,

  // Documents
  sport,
  player,
  team,
  tournament,
  article,
  product,
  productCategory,
  author,
]
```

---

## 5. GROQ Query Patterns

### 5.1 Sport Hub Page — Fetch Everything for a Sport Vertical

```groq
// GET /[sport] — Sport landing page with all related content
*[_type == "sport" && slug.current == $sportSlug][0] {
  _id,
  "name": name[$locale],
  slug,
  heroImage {
    ...,
    "url": asset->url,
    "lqip": asset->metadata.lqip
  },
  "overview": overview[$locale],
  hasTeams,

  // Top 6 players
  "featuredPlayers": *[_type == "player" && references(^._id)] | order(coalesce(contentContext.sentiment, "neutral") desc) [0...6] {
    _id,
    name,
    slug,
    "position": position[$locale],
    portrait { "url": asset->url, "lqip": asset->metadata.lqip },
    isActive,
    "teamName": currentTeam->name[$locale]
  },

  // Upcoming tournaments
  "upcomingTournaments": *[_type == "tournament" && references(^._id) && status == "upcoming"] | order(startDate asc) [0...4] {
    _id,
    "name": name[$locale],
    slug,
    edition,
    startDate,
    endDate,
    venue { name, city, country },
    coverImage { "url": asset->url }
  },

  // Live tournaments
  "liveTournaments": *[_type == "tournament" && references(^._id) && status == "live"] {
    _id,
    "name": name[$locale],
    slug,
    "latestMatch": schedule | order(dateTime desc) [0] {
      title, result, dateTime
    }
  },

  // Latest articles
  "latestArticles": *[_type == "article" && references(^._id) && status == "published"] | order(publishedAt desc) [0...8] {
    _id,
    "title": title[$locale],
    slug,
    "excerpt": excerpt[$locale],
    articleType,
    publishedAt,
    heroImage { "url": asset->url, "lqip": asset->metadata.lqip },
    "authorName": author->name
  },

  // Featured products
  "featuredProducts": *[_type == "product" && references(^._id)] [0...6] {
    _id,
    "name": name[$locale],
    slug,
    price,
    compareAtPrice,
    images[0] { "url": asset->url, "lqip": asset->metadata.lqip },
    "categoryName": category->name[$locale]
  }
}
```

### 5.2 Player Profile

```groq
// GET /[sport]/players/[slug]
*[_type == "player" && slug.current == $playerSlug][0] {
  _id,
  name,
  nickname,
  slug,
  portrait { ..., "url": asset->url },
  nationality,
  dateOfBirth,
  "bio": bio[$locale],
  socialProfiles,
  isActive,
  "position": position[$locale],

  // Expanded sport reference
  sport-> {
    _id,
    "name": name[$locale],
    slug,
    statFields
  },

  // Team info
  currentTeam-> {
    _id,
    "name": name[$locale],
    slug,
    logo { "url": asset->url }
  },
  pastTeams[]-> {
    _id,
    "name": name[$locale],
    slug,
    logo { "url": asset->url }
  },

  // Stats resolved against sport-defined stat fields
  stats,
  careerTimeline[] {
    year,
    "title": title[$locale],
    description,
    team-> { "name": name[$locale], slug },
    tournament-> { "name": name[$locale], slug }
  } | order(year desc),

  // Endorsed products
  endorsedProducts[]-> {
    _id,
    "name": name[$locale],
    slug,
    price,
    images[0] { "url": asset->url }
  },
  equipment[] {
    category,
    product-> {
      _id,
      "name": name[$locale],
      slug,
      price,
      images[0] { "url": asset->url }
    }
  },

  // Articles mentioning this player
  "relatedArticles": *[_type == "article" && references(^._id) && status == "published"] | order(publishedAt desc) [0...5] {
    _id,
    "title": title[$locale],
    slug,
    publishedAt,
    articleType,
    heroImage { "url": asset->url, "lqip": asset->metadata.lqip }
  },

  // Tournaments this player participates in
  "tournaments": *[_type == "tournament" && references(^._id)] | order(startDate desc) [0...5] {
    _id,
    "name": name[$locale],
    slug,
    edition,
    status,
    startDate
  },

  contentContext,
  seo
}
```

### 5.3 Product with Full Context

```groq
// GET /shop/[slug]
*[_type == "product" && slug.current == $productSlug][0] {
  _id,
  "name": name[$locale],
  slug,
  sku,
  externalId,
  "description": description[$locale],
  images[] { ..., "url": asset->url, "lqip": asset->metadata.lqip },
  price,
  compareAtPrice,
  variants,
  category-> {
    "name": name[$locale],
    slug,
    parent-> { "name": name[$locale], slug }
  },

  // Contextual relationships — the magic of entity-first modeling
  sports[]-> { _id, "name": name[$locale], slug },
  endorsedBy[]-> {
    _id,
    name,
    slug,
    portrait { "url": asset->url },
    sport-> { "name": name[$locale] }
  },
  featuredInTournaments[]-> {
    _id,
    "name": name[$locale],
    slug,
    edition,
    status
  },

  // Related products (same category)
  "relatedProducts": *[_type == "product" && category._ref == ^.category._ref && _id != ^._id] [0...4] {
    _id,
    "name": name[$locale],
    slug,
    price,
    images[0] { "url": asset->url }
  },

  // Articles that reference this product
  "relatedArticles": *[_type == "article" && references(^._id) && status == "published"] | order(publishedAt desc) [0...3] {
    _id,
    "title": title[$locale],
    slug,
    publishedAt
  },

  contentContext,
  seo
}
```

### 5.4 Cross-Entity Search Index (for Algolia Sync)

```groq
// Used by webhook → Algolia sync function
// Fetches all indexable entities with flattened, search-optimized shape
{
  "players": *[_type == "player"] {
    "objectID": _id,
    "type": "player",
    name,
    nickname,
    nationality,
    "sportName": sport->name.en,
    "sportSlug": sport->slug.current,
    "teamName": currentTeam->name.en,
    "tags": contentContext.aiTags,
    "manualTags": contentContext.manualTags,
    "audiences": contentContext.audiences,
    "image": portrait.asset->url,
    slug
  },
  "articles": *[_type == "article" && status == "published"] {
    "objectID": _id,
    "type": "article",
    "title": title.en,
    "excerpt": excerpt.en,
    articleType,
    publishedAt,
    "sportName": sport->name.en,
    "sportSlug": sport->slug.current,
    "authorName": author->name,
    "tags": contentContext.aiTags,
    "audiences": contentContext.audiences,
    "image": heroImage.asset->url,
    slug
  },
  "products": *[_type == "product"] {
    "objectID": _id,
    "type": "product",
    "name": name.en,
    sku,
    "price": price.amount,
    "currency": price.currency,
    "categoryName": category->name.en,
    "sportNames": sports[]->name.en,
    "tags": contentContext.aiTags,
    "image": images[0].asset->url,
    slug
  },
  "tournaments": *[_type == "tournament"] {
    "objectID": _id,
    "type": "tournament",
    "name": name.en,
    edition,
    status,
    startDate,
    "sportName": sport->name.en,
    "sportSlug": sport->slug.current,
    "venueName": venue.name,
    "tags": contentContext.aiTags,
    "image": coverImage.asset->url,
    slug
  }
}
```

---

## 6. Frontend Architecture

The following applies to the **`apps/web`** package only. Sanity Studio is not part of this tree.

### 6.1 Next.js App Router Structure

Relative to `apps/web/`:

```
app/
├── (marketing)/
│   ├── page.tsx                          # Homepage
│   └── layout.tsx                        # Marketing layout
├── [sport]/
│   ├── page.tsx                          # Sport Hub (ISR 60s)
│   ├── layout.tsx                        # Sport-scoped layout + nav
│   ├── players/
│   │   ├── page.tsx                      # Players listing
│   │   └── [slug]/
│   │       └── page.tsx                  # Player profile (ISR 300s)
│   ├── teams/
│   │   ├── page.tsx                      # Teams listing
│   │   └── [slug]/
│   │       └── page.tsx                  # Team detail
│   ├── tournaments/
│   │   ├── page.tsx                      # Tournaments listing
│   │   └── [slug]/
│   │       └── page.tsx                  # Tournament detail (ISR 120s)
│   └── news/
│       ├── page.tsx                      # News feed
│       └── [slug]/
│           └── page.tsx                  # Article detail (SSR)
├── shop/
│   ├── page.tsx                          # Shop landing
│   ├── [category]/
│   │   └── page.tsx                      # Category listing
│   └── [slug]/
│       └── page.tsx                      # Product detail (ISR 60s)
├── search/
│   └── page.tsx                          # Global search (Client Component)
├── api/
│   ├── revalidate/
│   │   └── route.ts                      # On-demand ISR webhook
│   ├── search/
│   │   └── route.ts                      # Algolia proxy (Edge Runtime)
│   └── recommendations/
│       └── route.ts                      # ML recommendation endpoint
├── layout.tsx                            # Root layout (global nav, footer)
├── globals.css                           # Tailwind v4 + design tokens
└── not-found.tsx
```

### 6.2 Server Components vs Client Components

| Pattern | Server Component (default) | Client Component (`'use client'`) |
|---|---|---|
| **Data fetching** | GROQ queries via `sanityClient.fetch()` | Never — data fetched on server, passed as props |
| **Sport hub layout** | Full page RSC with Suspense boundaries | Interactive filters, live score ticker |
| **Player profile** | Bio, stats, career timeline | Image gallery carousel, tab switching |
| **Article body** | Portable Text rendering | Social sharing buttons, comments |
| **Product detail** | Product info, related items | Add to cart, variant selector, quantity |
| **Search** | N/A | Full client component (Algolia InstantSearch) |
| **Navigation** | Sport dropdown, mega menu structure | Mobile hamburger, active state tracking |

### 6.3 Component Architecture Map

```
┌─────────────────────────────────────────────────────────────┐
│ Layout Components (Server)                                  │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐               │
│ │ RootLayout │ │ SportLayout│ │ ShopLayout │               │
│ └──────┬─────┘ └──────┬─────┘ └──────┬─────┘               │
│        │              │              │                      │
│ ┌──────▼──────────────▼──────────────▼───────────────────┐  │
│ │ Shared Components                                      │  │
│ │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │  │
│ │ │GlobalNav │ │SportNav  │ │ Footer   │ │Breadcrumbs │ │  │
│ │ └──────────┘ └──────────┘ └──────────┘ └────────────┘ │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                             │
│ Page Components (Server)                                    │
│ ┌──────────────────┐  ┌──────────────────┐                  │
│ │ SportHubPage     │  │ PlayerProfile    │                  │
│ │ ├─HeroSection    │  │ ├─PlayerHero     │                  │
│ │ ├─LiveTicker*    │  │ ├─StatsDashboard │                  │
│ │ ├─FeaturedPlayers│  │ ├─CareerTimeline │                  │
│ │ ├─TournamentCards│  │ ├─EquipmentGrid  │                  │
│ │ ├─NewsFeed       │  │ ├─RelatedArticles│                  │
│ │ └─ProductShelf   │  │ └─EndorsedShop*  │                  │
│ └──────────────────┘  └──────────────────┘                  │
│                                                             │
│ ┌──────────────────┐  ┌──────────────────┐                  │
│ │ TournamentDetail │  │ ProductDetail    │                  │
│ │ ├─TournamentHero │  │ ├─ProductGallery*│                  │
│ │ ├─BracketView*   │  │ ├─PriceBlock     │                  │
│ │ ├─ScheduleTable  │  │ ├─VariantPicker* │                  │
│ │ ├─Participants   │  │ ├─AddToCart*     │                  │
│ │ └─OfficialMerch  │  │ ├─ContextLinks  │                  │
│ └──────────────────┘  │ └─RelatedProducts│                  │
│                       └──────────────────┘                  │
│                                                             │
│ * = Client Component (interactive)                          │
└─────────────────────────────────────────────────────────────┘
```

### 6.4 Tailwind CSS v4 Design Token System

Tokens and global styling must be reconciled with **[`DESIGN.md`](DESIGN.md)** (Kinetic Stadium: surfaces, accents, typography, no-line rule). Page shells and key layouts should be validated against the **Stitch** HTML mockups in [`stitch_project_placeholder_title/`](stitch_project_placeholder_title/) (see **Design references** at the top of this document). The example `@theme` block below is a baseline; extend or replace values where `DESIGN.md` specifies different hex roles (e.g. primary `#005bbf`).

```css
/* === globals.css === */
/* Google Stitch-inspired token system — align with DESIGN.md + stitch_project_placeholder_title mocks */

@import "tailwindcss";

@theme {
  /* --- Color Scales --- */
  --color-surface-primary:   #FFFFFF;
  --color-surface-secondary: #F8F7F4;
  --color-surface-elevated:  #FFFFFF;
  --color-surface-inverse:   #1A1A1A;

  --color-text-primary:      #1A1A1A;
  --color-text-secondary:    #5F5F5F;
  --color-text-tertiary:     #8A8A8A;
  --color-text-inverse:      #FFFFFF;
  --color-text-accent:       #1A73E8;

  --color-border-default:    #E0DDD8;
  --color-border-subtle:     #F0EDE8;
  --color-border-strong:     #1A1A1A;

  --color-accent-primary:    #1A73E8;
  --color-accent-hover:      #1557B0;
  --color-accent-cricket:    #2E7D32;
  --color-accent-tennis:     #F57F17;
  --color-accent-esports:    #7B1FA2;

  --color-status-live:       #D32F2F;
  --color-status-upcoming:   #1A73E8;
  --color-status-completed:  #5F5F5F;

  /* --- Typography Scale --- */
  --font-family-display:     'Google Sans Display', 'Google Sans', system-ui, sans-serif;
  --font-family-body:        'Google Sans Text', 'Google Sans', system-ui, sans-serif;
  --font-family-mono:        'Google Sans Mono', 'Roboto Mono', monospace;

  --font-size-xs:    0.75rem;
  --font-size-sm:    0.875rem;
  --font-size-base:  1rem;
  --font-size-lg:    1.125rem;
  --font-size-xl:    1.25rem;
  --font-size-2xl:   1.5rem;
  --font-size-3xl:   1.875rem;
  --font-size-4xl:   2.25rem;
  --font-size-5xl:   3rem;
  --font-size-hero:  4rem;

  /* --- Spacing Scale --- */
  --spacing-section: 5rem;
  --spacing-card:    1.5rem;

  /* --- Radius --- */
  --radius-sm:       0.5rem;
  --radius-md:       0.75rem;
  --radius-lg:       1rem;
  --radius-xl:       1.5rem;
  --radius-full:     9999px;

  /* --- Shadows (Stitch material elevation) --- */
  --shadow-card:     0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06);
  --shadow-elevated: 0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06);
  --shadow-overlay:  0 12px 40px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.1);

  /* --- Motion --- */
  --ease-spring:     cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth:     cubic-bezier(0.25, 0.1, 0.25, 1);
  --duration-fast:   150ms;
  --duration-normal: 250ms;
  --duration-slow:   400ms;
}

/* Dark mode overrides */
@media (prefers-color-scheme: dark) {
  :root {
    --color-surface-primary:   #1A1A1A;
    --color-surface-secondary: #242424;
    --color-surface-elevated:  #2E2E2E;
    --color-surface-inverse:   #FFFFFF;
    --color-text-primary:      #E8E6E1;
    --color-text-secondary:    #A0A0A0;
    --color-text-tertiary:     #6A6A6A;
    --color-text-inverse:      #1A1A1A;
    --color-border-default:    #3A3A3A;
    --color-border-subtle:     #2E2E2E;
  }
}
```

### 6.5 Revalidation Webhook (On-Demand ISR)

```typescript
// === app/api/revalidate/route.ts ===
import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { parseBody } from 'next-sanity/webhook'

const REVALIDATION_MAP: Record<string, (doc: any) => string[]> = {
  sport: (doc) => [`/${doc.slug?.current}`],
  player: (doc) => [
    `/${doc.sport?.slug?.current}/players/${doc.slug?.current}`,
    `/${doc.sport?.slug?.current}`, // Revalidate sport hub too
  ],
  team: (doc) => [
    `/${doc.sport?.slug?.current}/teams/${doc.slug?.current}`,
    `/${doc.sport?.slug?.current}`,
  ],
  tournament: (doc) => [
    `/${doc.sport?.slug?.current}/tournaments/${doc.slug?.current}`,
    `/${doc.sport?.slug?.current}`,
  ],
  article: (doc) => [
    `/${doc.sport?.slug?.current}/news/${doc.slug?.current}`,
    `/${doc.sport?.slug?.current}`,
  ],
  product: (doc) => [
    `/shop/${doc.slug?.current}`,
    `/shop`,
  ],
}

export async function POST(req: NextRequest) {
  try {
    const { body, isValidSignature } = await parseBody<{
      _type: string
      slug?: { current: string }
      sport?: { slug?: { current: string } }
    }>(req, process.env.SANITY_REVALIDATE_SECRET!)

    if (!isValidSignature) {
      return new NextResponse('Invalid signature', { status: 401 })
    }

    if (!body?._type) {
      return new NextResponse('Missing document type', { status: 400 })
    }

    const pathsFn = REVALIDATION_MAP[body._type]
    if (pathsFn) {
      const paths = pathsFn(body)
      paths.forEach((path) => revalidatePath(path))

      // Also revalidate by tag for more granular control
      revalidateTag(body._type)
    }

    return NextResponse.json({
      revalidated: true,
      type: body._type,
      now: Date.now(),
    })
  } catch (err) {
    return new NextResponse('Webhook handler failed', { status: 500 })
  }
}
```

---

## 7. Personalization & Recommendations

### 7.1 Architecture Overview

```
User Visit
    │
    ▼
Vercel Edge Middleware
    │
    ├── Read cookies: preferredSports[], viewHistory[], userId
    ├── Geo lookup: country, region
    ├── A/B test assignment (Edge Config)
    │
    ▼
Server Component (RSC)
    │
    ├── Pass personalization context via headers
    ├── Fetch personalized GROQ queries
    │     (filter by sport affinity, locale, audience)
    │
    ▼
Personalization Engine (API Route / Edge Function)
    │
    ├── Collaborative filtering: "Users who viewed X also viewed Y"
    ├── Content-based: Match contentContext.aiTags across entities
    ├── Contextual: Boost products relevant to currently-viewed sport/player
    │
    ▼
Client Hydration
    │
    ├── Track interactions → analytics pipeline
    └── Update preference cookies
```

### 7.2 Edge Middleware for Personalization

```typescript
// === middleware.ts ===
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const geo = request.geo

  // --- Locale Detection ---
  const preferredLocale =
    request.cookies.get('locale')?.value ||
    negotiateLocale(request.headers.get('accept-language')) ||
    'en'
  response.headers.set('x-locale', preferredLocale)

  // --- Sport Affinity ---
  const sportHistory = request.cookies.get('sport-affinity')?.value || '[]'
  response.headers.set('x-sport-affinity', sportHistory)

  // --- Geo Context ---
  if (geo?.country) {
    response.headers.set('x-user-country', geo.country)
    response.headers.set('x-user-region', geo.region || '')
  }

  // --- A/B Test Cohort ---
  const cohort = request.cookies.get('ab-cohort')?.value || assignCohort()
  if (!request.cookies.get('ab-cohort')) {
    response.cookies.set('ab-cohort', cohort, { maxAge: 60 * 60 * 24 * 30 })
  }
  response.headers.set('x-ab-cohort', cohort)

  return response
}

function assignCohort(): string {
  return Math.random() < 0.5 ? 'control' : 'variant'
}

function negotiateLocale(acceptLanguage: string | null): string {
  if (!acceptLanguage) return 'en'
  const supported = ['en', 'es', 'hi', 'ja']
  const preferred = acceptLanguage.split(',')[0].split('-')[0]
  return supported.includes(preferred) ? preferred : 'en'
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
}
```

### 7.3 Recommendation GROQ Patterns

```groq
// Content-based: "More like this" for a player
// Uses shared AI tags to find semantically similar content
*[_type == "article"
  && status == "published"
  && count((contentContext.aiTags)[@ in $playerTags]) > 2
  && _id != $currentArticleId
] | order(publishedAt desc) [0...5] {
  _id,
  "title": title[$locale],
  slug,
  articleType,
  publishedAt,
  heroImage { "url": asset->url }
}

// Contextual product recommendations
// "Products endorsed by players in the tournament you're viewing"
*[_type == "product"
  && count(endorsedBy[_ref in $tournamentParticipantIds]) > 0
] [0...6] {
  _id,
  "name": name[$locale],
  slug,
  price,
  images[0] { "url": asset->url },
  "endorserNames": endorsedBy[]->name
}

// Geo-aware product boost: cricket gear in India, tennis in France
*[_type == "product"
  && references(*[_type == "sport" && slug.current == $geoRelevantSport][0]._id)
] | score(
  boost(price.currency == $userCurrency, 3),
  boost(count((contentContext.audiences)[@ in $userAudiences]) > 0, 2)
) [0...8] {
  _id,
  "name": name[$locale],
  slug,
  price,
  images[0] { "url": asset->url }
}
```

---

## 8. Search Strategy

### 8.1 Algolia Integration Architecture

```
Sanity Webhook (on publish/update)
    │
    ▼
Vercel Serverless Function
    │
    ├── Fetch updated document via GROQ
    ├── Flatten into Algolia-optimized record
    ├── Push to index: sportverse_{entity_type}
    │
    ▼
Algolia Indices:
    ├── sportverse_players     (facets: sport, nationality, isActive)
    ├── sportverse_articles    (facets: sport, articleType, publishedAt)
    ├── sportverse_products    (facets: sport, category, price range)
    ├── sportverse_tournaments (facets: sport, status, startDate)
    └── sportverse_unified     (federated search across all types)
```

### 8.2 Search Record Shape (Algolia-optimized)

```typescript
// Example: Player record for Algolia
interface AlgoliaPlayerRecord {
  objectID: string           // Sanity _id
  type: 'player'
  name: string
  nickname?: string
  nationality: string
  sportName: string
  sportSlug: string
  teamName?: string
  isActive: boolean
  tags: string[]             // Merged: aiTags + manualTags
  audiences: string[]
  imageUrl?: string
  slug: string
  _geoloc?: {               // For geo-search (team location)
    lat: number
    lng: number
  }
}
```

### 8.3 Frontend: Federated Search Component

```typescript
// Simplified — uses Algolia's React InstantSearch
// app/search/page.tsx → Client Component

// Federated search hits multiple indices simultaneously:
// - Players, Articles, Products, Tournaments
// - Results grouped by type
// - Faceted by sport, audience, content type
// - URL-synced state for shareable searches
```

---

## 9. AI Enrichment Pipeline

### 9.1 Pipeline Architecture

```
Sanity Document Published
    │
    ▼
Webhook → Vercel Function (ai-enrichment)
    │
    ├── 1. Fetch document via GROQ (full content)
    ├── 2. Generate AI Summary (Claude Sonnet)
    │      Prompt: "Summarize this {type} in 2 sentences for a sports fan."
    ├── 3. Generate AI Tags (Claude Sonnet)
    │      Prompt: "Extract 5-10 topical tags from: {content}"
    ├── 4. Compute Embedding (text-embedding model)
    │      Store vector in Pinecone/Weaviate under embeddingVector ID
    ├── 5. Analyze Sentiment
    │      Classify as: positive / neutral / negative / controversial
    ├── 6. Patch document via Sanity Mutation API
    │      Update: contentContext.aiSummary, aiTags, embeddingVector, sentiment
    │
    ▼
Document Updated (AI fields populated)
    │
    ▼
Algolia re-indexed with enriched tags
```

### 9.2 Enrichment Function

```typescript
// === Simplified pseudo-code for AI enrichment ===

async function enrichDocument(docId: string, docType: string) {
  // 1. Fetch content
  const doc = await sanityClient.fetch(
    `*[_id == $id][0]{ ... }`,
    { id: docId }
  )

  // 2. Extract text content
  const textContent = extractPlainText(doc)

  // 3. AI enrichment via Claude
  const [summary, tags, sentiment] = await Promise.all([
    generateSummary(textContent, docType),
    generateTags(textContent),
    analyzeSentiment(textContent),
  ])

  // 4. Generate embedding
  const embeddingId = await storeEmbedding(docId, textContent)

  // 5. Patch back to Sanity
  await sanityClient
    .patch(docId)
    .set({
      'contentContext.aiSummary': summary,
      'contentContext.aiTags': tags,
      'contentContext.sentiment': sentiment,
      'contentContext.embeddingVector': embeddingId,
    })
    .commit()
}
```

---

## 10. Deployment & Infrastructure

### 10.0 Monorepo deployment

- **Vercel (frontend):** Create a Vercel project whose **root directory** is `apps/web` (not the monorepo root). Place `vercel.json` (see §10.1) in `apps/web` so framework detection, crons, and headers apply only to the Next.js app.
- **Sanity Studio:** Deploy from **`apps/studio`** via `sanity deploy` (Sanity-hosted Studio) or a separate static hosting pipeline; CI should run schema checks and `sanity schema deploy` from that package when required.
- **Environment variables:** Split by package — Next.js env in Vercel for `apps/web`; Studio tokens and `SANITY_STUDIO_*` values configured for the Studio build. Both target the same Sanity **project** and **dataset** (see project details at top of document).
- **Webhooks:** Revalidation and integration endpoints live on the **web** app URLs; webhook URLs in Sanity management must point at the deployed `apps/web` origin.

### 10.1 Vercel Configuration

```json
// apps/web/vercel.json
{
  "framework": "nextjs",
  "regions": ["iad1", "lhr1", "hnd1"],
  "crons": [
    {
      "path": "/api/cron/sitemap",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/stale-revalidation",
      "schedule": "0 */6 * * *"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

### 10.2 Environment Architecture

| Environment | Sanity Dataset | Branch | Purpose |
|---|---|---|---|
| Production | `production` | `main` | Live site |
| Staging | `staging` | `staging` | QA & content preview |
| Development | `development` | `dev/*` | Feature development |
| Preview | `production` | PR branches | Vercel preview deployments |

### 10.3 Performance Budget

| Metric | Target | Strategy |
|---|---|---|
| LCP | < 2.5s | ISR + CDN, LQIP image placeholders, font preloading |
| FID | < 100ms | Minimal client JS, RSC by default, code splitting |
| CLS | < 0.1 | Explicit image dimensions, skeleton loaders |
| TTFB | < 200ms | Edge rendering, regional Sanity CDN |
| Bundle Size (JS) | < 150KB gzipped | Tree shaking, dynamic imports, no unnecessary client components |

---

## 11. Schema Relationship Summary

```
sport ──────┬──→ player ──────┬──→ team
            │                 │
            ├──→ team ────────┤
            │                 │
            ├──→ tournament ──┤
            │                 │
            ├──→ article ─────┤
            │                 │
            └──→ product ─────┘
                    │
                    ├──→ productCategory (tree)
                    ├──→ player (endorsedBy / equipment)
                    └──→ tournament (featuredIn)

article ──→ sport, player[], team[], tournament[], product[]
player  ──→ sport, team (current + past), product[] (endorsed + equipment)
tournament ──→ sport, team[] | player[] (participants), product[] (merch)
product ──→ sport[], player[] (endorsedBy), tournament[] (featuredIn), productCategory
```

Every entity is reachable from every other entity through at most two hops. This enables contextual merchandising ("Virat Kohli uses this bat"), editorial cross-linking ("Related to IPL 2025"), and AI-powered recommendations across content and commerce boundaries.

---

## Appendix A: Sanity Studio Customization Notes

In **`apps/studio`**, the Studio should be configured with a custom desk structure that organizes content by sport vertical first, then by entity type within each vertical. This mirrors the mental model of content editors who think in terms of "I'm working on Cricket content" rather than "I'm working on all players across all sports."

The structure builder should create a top-level item for each sport (fetched dynamically), with nested lists for Players, Teams, Tournaments, Articles, and Products filtered by that sport reference. A separate "Cross-Vertical" section should house Authors, Product Categories, and global settings.

## Appendix B: Glossary

| Term | Definition |
|---|---|
| **Entity-first modeling** | Content architecture where schemas represent real-world objects (Player, Tournament) rather than page types (Homepage, Landing Page) |
| **Contextual merchandising** | Displaying products in context of the content being viewed (player's equipment on their profile, tournament merch on event pages) |
| **ContentContext** | The reusable AI metadata object embedded in every document for enrichment, personalization, and search optimization |
| **ISR** | Incremental Static Regeneration — Next.js strategy for static pages that revalidate in the background |
| **GROQ** | Graph-Relational Object Queries — Sanity's native query language |
| **Edge Middleware** | Vercel Edge Functions that run before page rendering for personalization, geo-routing, and A/B testing |
