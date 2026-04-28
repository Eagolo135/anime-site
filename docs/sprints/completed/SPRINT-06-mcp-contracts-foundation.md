# SPRINT-06: MCP Contracts and Foundation

Status: Completed
Completion date: 2026-04-28
Phase alignment: Phase 8

## Objective
Establish MCP contracts and initial implementation foundation for Shir0 orchestration.

## Completed
- Added source-of-truth MCP contract document: `docs/spec/MCP_CONTRACTS.md`.
- Added typed MCP contracts module: `src/lib/mcp/contracts.ts`.
- Added dispatcher skeleton: `src/lib/mcp/dispatcher.ts`.
- Added route endpoints:
  - `src/app/api/mcp/chat/route.ts`
  - `src/app/api/mcp/poem/route.ts`
  - `src/app/api/mcp/image/route.ts`
  - `src/app/api/mcp/dispatch/route.ts`
- Added provider adapters:
  - `src/lib/providers/llmShir0Provider.ts`
  - `src/lib/providers/llmPoemProvider.ts`
  - `src/lib/providers/jikanImageProvider.ts`
- Updated spec and decision logs for MCP runtime and boundaries.

## Drift Detected
- No drift. Work remained within contract/foundation scope with no major UI expansion.

## QA Summary
- `npm run lint` passed.
- `npm run build` passed.
- Route smoke checks passed for `chat`, `poem`, and `dispatch` endpoints.

## Notes
- LLM providers currently use safe fallback behavior when `OPENAI_API_KEY` is not set.
- Full ambiguity/intent logic and UI integration are deferred to Sprint 07/08.

## Next Sprint Recommendation
Promote `SPRINT-07: MCP Routes and Dispatch Behavior` to current.
