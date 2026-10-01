# Testing policy

- Unit (Vitest): every domain function, including empty input, case handling and combined filters.
- Component (Testing Library): user-visible behaviour through roles and labels, including keyboard use.
- End to end (Playwright): the main journey in a real browser; the server port comes from `PORT`/`E2E_PORT`.
- Never weaken, skip or delete tests to make a change pass. Each acceptance criterion maps to at least one named test.
