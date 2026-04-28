# Anime Poetry Archive Project Spec (Source of Truth)

Last updated: 2026-04-28
Owner: Nick + Implementation Agent
Status: Active

## 1) Product Vision
Create an anime-inspired digital poetry archive that feels like an interactive web-art exhibit, not a generic web app. The homepage should feel like entering a small digital universe.

## 2) Experience Direction
- Tone: dynamic, graphic, playful, expressive, immersive, slightly theatrical.
- Art direction (locked baseline): retro anime cel.
- Composition priority: strong focal center with layered atmosphere.
- Motion priority: authored transitions that communicate state change.
- Anti-patterns: generic SaaS nav-first layout, plain card-grid identity, flat color-only background.

## 3) Current Goals (V1 UI-First)
- Build homepage intro state with:
  - Full-screen layout
  - Large central `Push Here` button
  - Subtitle: `Where anime meets poetry`
  - Atmospheric layered visuals
- Build smooth intro -> search transition.
- Build first artistic search state supporting mock search by anime title, character, or phrase.
- Use mock data only.
- Enrich search/archive cards with image lookups from Jikan while keeping mock poetry entries as canonical data.
- Start MCP tool orchestration track:
  - Shir0 mascot conversational tool
  - LLM poem creator tool
  - Anime image fetch tool (Jikan-backed)
  - Dispatcher tool that coordinates the other tools

## 4) Non-Goals (Current)
- No production backend or database.
- No long-term user accounts or persistent chat profiles.
- No full production AniList/Jikan content integration yet (title metadata and poem content still mock-driven).
- No account/auth system.

## 5) Architecture Notes
- Framework: Next.js (App Router) + TypeScript.
- Styling: Tailwind CSS with CSS variables and authored scene styles.
- Motion: Framer Motion first; GSAP only if Framer cannot achieve target transition quality.
- Data strategy: local mock data module with future adapter boundary.
- Adapter contracts: documented in `docs/spec/ADAPTER_CONTRACTS.md`.
- MCP contracts: documented in `docs/spec/MCP_CONTRACTS.md`.
- Asset strategy:
  - `public/assets/content/` for replaceable anime/content images.
  - `public/assets/decorative/` for UI motifs/textures/atmospherics.

## 6) UX Principles
- First impression should be experiential and memorable.
- Every motion should reinforce narrative state shift.
- Search state should retain art identity, not switch to utility-only UI.
- Maintain readability and interaction clarity while being expressive.
- Desktop-first, mobile-safe baseline.

## 7) Feature List
### Core (Now)
- Intro scene
- Push interaction
- Animated morph to search scene
- Search input and mock result rendering

### Near-Term
- Archive display refinements
- Result card interactions and detail entry
- Data adapter boundaries for broader API integration
- Limited Jikan image enrichment (current)
- Shir0 conversational panel with ambiguity resolution
- LLM poem generation and image-display orchestration

### Future
- AniList/Jikan integration
- Custom image pipeline
- Advanced filters and curation tools

## 8) Technical Stack
- Next.js
- React
- Tailwind CSS
- Framer Motion
- TypeScript
- Optional later: Playwright (golden path), Lighthouse audit in polish phase

## 9) Development Phases
1. Planning and Spec Governance
2. UI Foundation
3. Homepage Intro Experience
4. Search Experience V1
5. Archive and Display V1
6. Integration Preparation
7. QA and Polish
8. MCP Contracts and Dispatcher Foundation
9. Shir0 Conversation and Tool Orchestration

See `docs/phases/PHASES.md` for detail.

## 10) Sprint System
- One current sprint only.
- New requests mid-sprint are evaluated for fit:
  - If required for sprint DoD, include and log in change notes.
  - Otherwise move to queued sprints.
- Every sprint must include:
  - Objective
  - Scope
  - Deliverables
  - Files likely touched
  - Risks
  - Drift check
  - QA checklist
  - Definition of done

## 11) Drift Control Protocol
### Pre-Sprint Check (required)
- Compare sprint objective with sections 2, 3, and 4 of this spec.
- Reject contradictions before coding.
- Record verdict in sprint file.

### During Sprint
- If decisions change, update:
  - `docs/spec/PROJECT_SPEC.md`
  - `docs/spec/CHANGE_LOG.md`
  - relevant sprint file

### Post-Sprint
- Record completed work, drift found, updates made, and next sprint recommendation in `docs/sprints/completed/`.

## 12) QA Plan (Practical Frontend Loop)
- Visual review
- Responsive review
- Interaction review
- Code sanity review
- Optional when stable: Playwright golden-path smoke
- Later polish phase: Lighthouse performance/accessibility pass

See `docs/qa/QA_STRATEGY.md`.

## 13) Open Questions
- LLM provider wiring for Shir0/poem tools in environment setup.
- Conversation session memory strategy (short-lived vs persisted).

## 14) Backlog (High-Level)
- Visual motif pack for decorative assets
- Archive detail transition concepts
- Integration adapter skeleton for AniList/Jikan
- Search empty-state poetry microcopy set
- Confidence scoring for anime title -> Jikan image matches
