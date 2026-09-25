# Qpon e2e tests

Playwright tests that drive the real app — Angular UI, Nest API and Postgres — the way a user does.

## Running

```bash
npm ci
npx playwright install chromium
npm run stack:up     # production image + empty Postgres on :3000
npm test
npm run stack:down
```

Useful while writing tests: `npm run test:ui`, `npx playwright test --headed`, `npm run report`.

To run against `ng serve` instead, start the API and frontend yourself and set
`BASE_URL=http://localhost:4200` and `API_URL=http://localhost:3000/api`.

To run against a deployed environment, set `BASE_URL` and the credentials from
[.env.e2e.example](.env.e2e.example). Every test writes only inside an
organization it creates and deletes, so this is safe on a shared environment.

## Configuration

Settings come from environment variables, or from a git-ignored `.env.e2e`
(see [.env.e2e.example](.env.e2e.example)), and are exposed through
[src/env.ts](src/env.ts). Defaults apply only when `BASE_URL` is localhost.

The suite signs in with a fixed set of accounts, reused on every run:

| Account | Purpose |
|---|---|
| `SUPER_ADMIN_EMAIL` | Arranges test data through the API. Created by the setup project on a fresh database. |
| `e2e-admin@`, `e2e-editor@`, `e2e-viewer@` | The signed-in browser user. Invited into each test's organization with the role the test asks for. |

## Writing tests

- **Import `test` and `expect` from `src/fixtures`**, never from `@playwright/test`.
- **Each test is independent.** The `organization` fixture gives every test a
  fresh organization and deletes it (and everything in it) afterwards. Don't
  rely on seed data or on another test having run.
- **Arrange through the API, act and assert through the UI.** Use fixtures like
  `createItem` to set up state; only drive the UI for the behaviour under test.
- **Pick the role with `test.use({ role: 'viewer' })`.** The default is `admin`.
- **Locate elements the way users see them:** `getByRole`, `getByLabel`,
  `getByText`, `getByPlaceholder`. If an element has no accessible name (an
  icon-only button, say), add an `aria-label` in the app rather than a CSS
  selector or test id.
- **Page objects** in `src/pages` hold locators and multi-step actions only —
  assertions stay in the spec.

## Layout

```
src/
  env.ts           typed settings + credentials
  api/qpon-api.ts  API client used by fixtures to arrange data
  fixtures/        the `test` object specs import
  pages/           page objects
tests/
  global.setup.ts  creates/verifies the accounts, once per run
  items/           one folder per feature
```
