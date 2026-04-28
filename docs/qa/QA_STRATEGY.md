# QA Strategy (Practical Frontend Loop)

## Per-Sprint QA Loop
1. Visual review
- Validate composition, hierarchy, and mood against spec.
- Reject generic layout regressions.

2. Responsive review
- Desktop-first fidelity.
- Mobile-safe baseline for layout and interaction targets.

3. Interaction review
- Check animation timing, transition smoothness, and input behavior.
- Verify keyboard accessibility for interactive controls.

4. Code sanity review
- Keep components reusable and scoped.
- Ensure naming clarity and avoid dead code.

## Tooling Approach
- Early sprints: manual verification + lint/build checks.
- Mid-stage stability: add Playwright golden-path smoke checks.
- Polish stage: run Lighthouse for performance/accessibility guidance.

## Non-Blocking Rule
QA should improve confidence without stalling creative UI iteration.
Critical interaction or accessibility issues block completion; minor polish issues go to backlog.
