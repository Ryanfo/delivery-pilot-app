# Coding standards

- TypeScript `strict` with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`; no `any`, no non-null assertions.
- Small, named, pure functions in `src/domain/`; components stay thin.
- Stable IDs from data, never array indexes, for React keys.
- Handle errors at boundaries (storage, parsing); never let them crash rendering.
- Accessibility: every control has a visible, associated label; keyboard operable; status updates use `aria-live` or `role="status"`.
- No blanket lint or type suppressions; fix the cause.
