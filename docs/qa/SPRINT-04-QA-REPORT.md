# Sprint 04 QA Report

Date: 2026-04-28

## Automated Checks
- Playwright golden-path smoke: PASSED
- Lighthouse audit: COMPLETED

## Playwright Scope
File: `tests/golden-path.spec.ts`
- Intro renders with `Push Here`
- Transition into search state works
- Search submission updates result status
- Archive view toggle (`Stacks`) updates `aria-pressed`
- Empty-state message renders for no-match query

## Lighthouse Scores
Source: `docs/qa/lighthouse-report.json`
- Performance: 59
- Accessibility: 100
- Best Practices: 100
- SEO: 100

## Lighthouse Core Metrics
- FCP: 3.6 s
- LCP: 28.2 s
- TBT: 110 ms
- CLS: 0
- Speed Index: 8.7 s

## Findings
- Strength: Accessibility, best-practices, and SEO are excellent in current state.
- Risk: Performance score is low, dominated by high LCP and Speed Index.
- Likely contributor: hero/search scene heavy visual layers and external image loading behavior.

## Recommended Follow-Up (Non-Blocking)
1. Prioritize LCP optimization pass (defer non-critical visuals on first paint).
2. Add image loading strategy tuning for card artwork (sizes/priorities/placeholder tactics).
3. Re-run Lighthouse after targeted performance sprint.
