# Zoneless + Signals-Throughout Migration (frontend)

## Context

The frontend was just upgraded to Angular 22.2.0. The team now wants to drop `zone.js` (`provideZonelessChangeDetection`) and standardize state management on Angular signals and `@ngrx/signals` signal stores throughout, rather than the current mix of zone-driven change detection, plain mutable component fields, decorator-based `@Input()`/`@Output()`/`@ViewChild`, and manual `.subscribe()` calls that write to non-reactive fields.

A codebase audit turned up a key fact that anchors the whole plan: in Angular 22, `ChangeDetectionStrategy.OnPush = 0` is now the actual default, and the old "always check" behavior was renamed `Eager = 1` (`Default` is now a deprecated alias for `Eager`). The `ng update` migration we ran earlier inserted `changeDetection: ChangeDetectionStrategy.Eager` onto **every** component (91 files) specifically to freeze old zone-driven behavior in place. That means "remove `Eager`, go zoneless, use signals" are one and the same lever — a component can only safely drop `Eager` (i.e. become real `OnPush`) once everything it reads in its template is signal-driven. So Stage 3 (the zoneless flip) is really just the payoff of Stages 1–2 done correctly.

Audit summary (from full codebase survey):
- 38 `*.store.ts` files: 35 already use `@ngrx/signals` `signalStore()` + `rxMethod` + `tapResponse` idiomatically (e.g. `src/app/store/user.store.ts`, `src/app/components/home/coupons/coupon/campaign/coupon-code-list/store/coupon-codes.store.ts`). 3 are plain `@Injectable` classes with raw `signal()`s that mix in `.toPromise()`, manual `.subscribe()`, or direct DOM manipulation: `src/app/store/date-range.store.ts`, `src/app/components/home/dashboard/store/sales-summary.store.ts`, `src/app/components/home/reports/store/reports.store.ts`.
- 91 components, 100% carrying `ChangeDetectionStrategy.Eager`, 0 using `OnPush` explicitly.
- 20 `@Input()` sites (20 files), 9 `@Output()` sites (7 files), 7 `@ViewChild` sites — none yet using `input()`/`output()`/`viewChild()`. Several `@Input()`s are typed `Signal<T>` (hybrid decorator-of-a-signal anti-pattern), e.g. `campaign-details.component.ts:47-48`.
- 53 components call `.subscribe()` directly (0 use `async` pipe, 0 use `toSignal()`/`toObservable()`), frequently assigning results to plain class fields that templates read — these will silently stop updating under zoneless unless converted.
- One global pub/sub anti-pattern: `coupon-codes.store.ts:35` exports a module-level `EventEmitter` (`onChangeStatusSuccess`) consumed via `.subscribe()` in `campaign-change-status-dialog.ts` and similar dialogs.
- 5 `setTimeout(...)` sites write to plain (non-signal) fields for delayed UI resets (e.g. `dashboard/redemption-list/redemption-list.component.ts:194`, `services/coupon.state.service.ts:15`).
- Third-party risk areas: `ng2-charts` `BaseChartDirective` (single usage, `sales-trend-chart.component.ts`), CDK `Overlay`/`CdkPortal` manual positioning (`date-range-filter.component.ts`) — both historically zone-dependent, need a manual smoke test once zoneless is live.
- `@angular-architects/ngrx-toolkit` is deprecated in favor of `@ngrx-toolkit/core` (same API) — since every store file gets touched in Stage 2 anyway, do the import rename then.

**Decisions locked in with the user:**
- New branch `feature/zoneless-signals` off `feature/db`.
- Staged delivery with a build+verify checkpoint after each stage, reporting back between stages (not one silent giant pass).
- Roll the `@ngrx-toolkit/core` rename into Stage 2.
- Fix the 2 existing (already-broken, pre-existing) spec files to run under zoneless `TestBed` config — not a new test suite, just keeping the existing thin safety net alive.

**Scope boundary:** "signals throughout" means (a) purely local/ephemeral UI state (menu open flags, form-adjacent booleans, etc.) becomes local `signal()`/`computed()` inside the component, and (b) anything shared, async, or service-backed becomes/stays a `signalStore` — matching the pattern the 35 good stores already establish. It does **not** mean promoting every local boolean into a store.

## Stage 1 — Mechanical signal-API conversion (low risk)

Convert decorator-based APIs to their signal equivalents across all files that use them. This is purely mechanical and backward-compatible (both APIs coexist fine under zone in the interim), so it's safe to do first and verify with a normal build.

- `@Input()` → `input()` / `input.required()` (20 sites across 20 files). Special case: sites currently typed `@Input() x!: Signal<T>` (e.g. `campaign-details.component.ts`, `campaign-summary.component.ts`, `coupon-code-details.component.ts`, `coupon-details.component.ts`, `coupon-tab.component.ts`) become plain `input<T>()` / `input.required<T>()` — callers currently passing a `Signal` in the parent template must be updated to pass the unwrapped value (Angular signal inputs already receive reactive values from parent bindings, no extra wrapping needed).
- `@Output()` → `output()` (9 sites across 7 files).
- `@ViewChild` → `viewChild()` / `viewChild.required()` (7 sites: `customer-constraint.component.ts`, `edit-items.component.ts`, `dynamic-component-loader.component.ts`, `update-customer-constraint.component.ts`, `sales-trend-chart.component.ts`, `date-range-filter.component.ts` ×2).

Execution: delegate to 2-3 parallel agents batching files by feature area (e.g. one for `components/home/coupons/**`, one for `components/coupons/**` + `components/edit-coupon-code/**`, one for the remainder), each converting decorator usages to signal APIs in place and updating any internal reads (`this.foo` → `this.foo()`) and template bindings.

**Checkpoint:** `ng build` clean, `ng serve` smoke test of a few affected screens (coupon detail, campaign detail, item edit, customer constraint, dynamic component loader) in the browser pane.

## Stage 2 — State consolidation into signals/signal stores

1. **Bring the 3 outlier stores in line** with the established `signalStore(withState, withDevtools, withMethods(rxMethod(...tapResponse...)))` pattern used elsewhere:
   - `date-range.store.ts` — convert from plain `@Injectable` + raw `signal()`/`computed()` into a real `signalStore`.
   - `sales-summary.store.ts` — replace `.toPromise()` with `rxMethod` + `tapResponse`.
   - `reports.store.ts` — replace manual `.subscribe({next,error})` with `rxMethod`/`tapResponse`; leave the direct-DOM `saveFile()` anchor-click download logic as a plain method (no reactive state involved there, nothing to convert).

2. **Rename the deprecated package**: `@angular-architects/ngrx-toolkit` → `@ngrx-toolkit/core` in `package.json` and update the import statement across all 35 files that reference it (mechanical find/replace of the import specifier only — API is unchanged).

3. **Replace the `EventEmitter`-as-global-bus anti-pattern**: remove the module-level `onChangeStatusSuccess` `EventEmitter` from `coupon-codes.store.ts`; add a signal (or a store method callback) that the store itself exposes/updates on status-change success, and update `campaign-change-status-dialog.ts` and sibling `*-change-status-dialog*` components to read that store signal instead of subscribing to a free-floating emitter.

4. **Convert the 53 component-level `.subscribe()` sites**: for each, prefer moving the underlying async call into the owning feature's existing signal store as a new `rxMethod` exposing state via signals (the idiomatic path, matches existing 35-store pattern); where there's no natural store owner (one-off util/service calls with no shared state), wrap with `toSignal()` directly in the component instead of manual `.subscribe()`. Convert whatever plain class fields these subscriptions currently populate into `signal()`s (or drop them in favor of reading the store/`toSignal()` result directly in the template).

5. **Fix the 5 `setTimeout`-to-plain-field sites** (`coupon-code.component.ts:157`, `coupon-code-list.component.ts:192`, `recent-redemption-list/redemption-list.component.ts:133`, `dashboard/redemption-list/redemption-list.component.ts:194`, `services/coupon.state.service.ts:15`) to write through `signal.set()` instead of a plain field assignment.

Execution: delegate per-feature-area to agents (stores + their consuming components travel together, since converting a store's exposed shape often means updating the 1-3 components that read it). Suggested grouping: (a) dashboard stores+components, (b) coupons/campaigns/coupon-codes stores+components (largest cluster), (c) customers/items/organization stores+components, (d) settings/api-keys/team stores+components, (e) the 3 outlier stores + the EventEmitter-bus fix.

**Checkpoint:** `ng build` clean; browser smoke test covering dashboard charts/lists, coupon/campaign/coupon-code CRUD + status-change dialogs, customer/item CRUD, settings screens — since this stage changes actual data-flow wiring, not just syntax.

## Stage 3 — Zoneless cutover

1. `src/app/app.config.ts`: replace `provideZoneChangeDetection({ eventCoalescing: true })` with `provideZonelessChangeDetection()` (also drop the now-unused `provideZoneChangeDetection` import).
2. `angular.json`: remove `"zone.js"` from the `build` target polyfills, and remove `"zone.js"` + `"zone.js/testing"` from the `test` target polyfills.
3. `package.json`: remove the `zone.js` dependency; `npm install` to update the lockfile.
4. Remove `changeDetection: ChangeDetectionStrategy.Eager` (and the now-unused `ChangeDetectionStrategy` import where it's the only reason for the import) from all 91 component files — falls back to the new real default, `OnPush`. This is mechanical at this point because Stages 1-2 already made template-read state signal-driven.
5. Fix the 2 existing spec files (`app.component.spec.ts`, `sidenav.component.spec.ts`) minimally: they currently fail on missing `ActivatedRoute` provider and a missing `reflect-metadata` import ordering issue (pre-existing, unrelated to zoneless) — fix those two concrete failures and confirm they pass under the new zoneless `TestBed` configuration (no `provideZoneChangeDetection`/zone polyfill needed in test config anymore either).

**Checkpoint:** `ng build` clean, `ng test` passes (2/2), then a full manual browser smoke-test pass (see Stage 4) since this is the actual behavior-changing flip.

## Stage 4 — Verification & hardening

Manual browser smoke test via the preview tooling, covering:
- Login → dashboard (charts render and update — specifically watch the `ng2-charts` chart on `sales-trend-chart.component.ts` for redraw-on-data-change without zone).
- Coupons list → coupon detail → campaign detail → coupon-code detail, including status-change dialogs (the former `EventEmitter`-bus flow).
- The date-range filter's overlay/`CdkPortal` (`date-range-filter.component.ts`) — open/close and positioning without zone-triggered repositioning.
- Create/edit flows for coupons, campaigns, coupon codes, items, customers, organizations (forms, validation messages, multi-step wizards).
- Settings: team management, API keys, user/org profile edit dialogs.
- Table sort/pagination (Material table + `MatSort` + `MatPaginator`, which read component/store signals now) on the various list screens.
- Delayed-reset UI affordances that used to rely on `setTimeout` (e.g. "copied" state resets) — confirm they still revert visually now that they're signal-driven.

Report any element that doesn't update reactively as a concrete bug (file + line) rather than a generic "check page X" — at this point in the migration it means a signal/store wire-up was missed in Stage 1/2.

## Verification commands (run after each stage)

```bash
cd frontend
npx ng build
npx ng test --watch=false --browsers=ChromeHeadless
```

Plus the browser-pane smoke test described per stage using the existing `.claude/launch.json` `qpon-frontend` dev-server config (`npm run start --prefix frontend`, port 4200).
