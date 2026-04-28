# Decision Log

## D-001: UI-First Scope Lock
Date: 2026-04-28
Decision: Prioritize homepage intro, transition, and search UI with mock data before backend/integration.
Reason: Product value depends on immersive first impression and visual identity.
Impact: Backend and API work deferred to later phases.

## D-002: Transition System
Date: 2026-04-28
Decision: Use Framer Motion as primary transition engine; only add GSAP if needed.
Reason: Keep stack focused and maintainable while enabling expressive motion.
Impact: Motion variants centralized in app code; GSAP not added initially.

## D-003: Asset Boundary
Date: 2026-04-28
Decision: Separate decorative and content assets from day one.
Reason: Enables future swap of anime image sources and custom artwork without refactor.
Impact: Use `public/assets/decorative/` and `public/assets/content/`.

## D-004: Initial Typography Direction
Date: 2026-04-28
Decision: Use a bold display font for focal headlines/buttons and a rounded body font for readable poetic UI.
Reason: Supports authored, playful exhibit tone while keeping search/result text readable.
Impact: Layout font variables updated and consumed via global styles.

## D-005: Placeholder and Motion Assumptions for Sprint Start
Date: 2026-04-28
Decision: Begin implementation with warm cel + halftone/paper-grain atmosphere and subtle theatrical motion intensity.
Reason: Matches approved retro anime cel direction while avoiding early readability regressions.
Impact: Can be revised in spec if creative direction changes after visual review.

## D-006: Limited Jikan Image Enrichment
Date: 2026-04-28
Decision: Add a minimal Jikan-powered image lookup path for anime card visuals while keeping archive text/content mock-driven.
Reason: Stakeholder requested immediate visual authenticity gains without full backend/data integration.
Impact: Introduces a lightweight route handler and image fallback logic; broader API/data integration remains in later phases.

## D-007: Shir0 Runtime Choice
Date: 2026-04-28
Decision: Shir0 uses LLM-backed responses from day one, with guarded fallback responses when provider credentials are unavailable.
Reason: Stakeholder requested conversational flexibility immediately while maintaining resilience in local/dev environments.
Impact: Added LLM provider adapter for chat and contract-first response envelopes.

## D-008: Poem Tool Runtime Choice
Date: 2026-04-28
Decision: Poem creator uses LLM generation from day one with deterministic fallback template output.
Reason: Stakeholder requested LLM poem generation while requiring graceful degradation under provider failure.
Impact: Added poem LLM provider adapter and MCP poem route.

## D-009: MCP Tool Boundary Pattern
Date: 2026-04-28
Decision: All Shir0 orchestration actions go through MCP route boundaries (`chat`, `poem`, `image`, `dispatch`) rather than direct UI-provider calls.
Reason: Keeps orchestration testable, composable, and aligned with spec-driven tool contracts.
Impact: Added MCP contracts module and dispatch skeleton to coordinate tool calls.
