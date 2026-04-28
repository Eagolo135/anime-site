# Sprint 05 Performance Report

Date: 2026-04-28

## Goal
Improve initial rendering performance (LCP/Speed Index) while preserving artistic identity.

## Root Cause Found
Lighthouse showed an unusually high font payload:
- Font requests: 240
- Font transfer: 3,157,606 bytes

Primary fix:
- Replaced heavy body font with a lighter Latin-focused font in `src/app/layout.tsx`.
- Kept expressive display typography and visual direction intact.
- Retained deferred search loading and lighter transition filters from earlier Sprint 5 pass.

## Lighthouse Before/After
Source files:
- Before: `docs/qa/lighthouse-report.json`
- After: `docs/qa/lighthouse-report-after-sprint5.json`

Scores:
- Performance: 59 -> 80
- Accessibility: 100 -> 100
- Best Practices: 100 -> 100
- SEO: 100 -> 100

Core metrics:
- FCP: 3.6 s -> 0.9 s
- LCP: 28.2 s -> 5.4 s
- Speed Index: 8.7 s -> 0.9 s
- TBT: 110 ms -> 80 ms
- CLS: 0 -> 0

Font payload:
- Requests: 240 -> 2
- Transfer: 3,157,606 bytes -> 50,220 bytes

## Outcome
Meaningful performance improvement achieved without reducing visual identity or interaction quality.

## Follow-Up
- Optional next pass can target LCP from 5.4s toward sub-4s by reducing initial scene complexity further and deferring non-critical decorative layers on first paint.
