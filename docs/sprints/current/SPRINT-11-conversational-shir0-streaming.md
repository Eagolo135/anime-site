# SPRINT-11: Conversational Shir0 Streaming and Control

Status: Current
Start date: 2026-04-28

## Objective
Finish conversational UX parity by adding true server-streamed responses and explicit chat session controls.

## Scope
- Add optional streaming mode for `/api/mcp/dispatch`.
- Add client stream consumer for progressive Shir0 response rendering.
- Add explicit chat reset action to clear session memory.
- Add Playwright coverage for streaming and reset behavior.

## Deliverables
- Stable streaming response path with fallback to non-stream mode.
- Reset-chat UX control with session clear verification.
- QA notes for streaming and conversational regressions.

## Definition Of Done
Shir0 supports robust multi-turn conversation with stream-capable responses and user-controlled session reset, validated by automated tests.
