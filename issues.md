# Known API issues

Issues 2-9 came from a read of every controller, service and guard in `api/src`
while bringing `resources/openapi.json` in line with the exceptions the API
actually throws: the OpenAPI spec documents the *intended* contract, and those
items are where the code does not currently deliver it.

Issues 1 and 10 were found later by the API test suite, while fixing related
defects in `AuthorizationService` and `CampaignService`.

Each entry carries a **Status**. Fixed entries keep their number and their
description so the history stays readable; every fix is held in place by a
regression test named in the entry. See **Fixed, not separately listed** at the
end for two defects that were found and fixed without ever being numbered.

Still open: **4, 6, 7, 8, 9, 10**. None carries a live security consequence,
though issue 7 writes password hashes to stdout and should go next.

Ordered roughly by impact.

---

## 1. `create` and every read action bypass organization scoping

**Status: FIXED.**

`getSubjectTypes` now returns a subject *instance* carrying an organization id
for the actions that have no single entity to authorize against, built by a
`subjectInOrganization(subject, organizationId, path)` helper. The helper uses
`Object.create(subject.prototype)` so `detectSubjectType` still resolves the
right class without running the entity constructor, and falls back to the bare
class when a route genuinely carries no `organization_id` (e.g.
`GET /users/:user_id/organizations`, `POST /organizations`), where only rules
without an organization condition can match anyway.

Where a route names one entity, the guard resolves that entity rather than
trusting the path — otherwise pairing your own organization id with someone
else's coupon id would still pass. `read` of a single Coupon, Campaign,
CouponCode or Item therefore goes through the same `fetch*ForValidation` call
that `update` and `delete` already used; `create` and `read_all` are scoped to
the path organization.

Two further gaps surfaced while fixing this, neither of them in the original
description:

- **`CouponItem` had no branch at all**, so it reached the bare-class `else`
  and *every* action on it — create, read, update and delete — was permitted
  in any organization. It now resolves the real coupon through
  `fetchCouponForValidation` and authorizes against that coupon's
  organization. (This also gives `couponItemService` a use; it had been
  injected and never called.)
- **Four of the reporting views** —
  `ItemWiseDayWiseRedemptionSummaryMv`, `CouponCodesWiseDayWiseRedemptionSummaryMv`,
  `DayWiseRedemptionSummaryMv` and `CustomerWiseDayWiseRedemptionSummaryMv` —
  were missing from the materialized-view branch and fell through to the same
  `else`, leaving the reporting endpoints readable across organizations. They
  are now listed there and scoped by `organizationId`.

`ApiKey` create/read is scoped to the path organization rather than resolved,
because `fetchApiKey` returns `null` for an organization with no key yet and
CASL cannot type `null`. `Redemption`, which previously returned the bare
class for every action, is scoped the same way.

Held by 41 cases in `api/test/e2e/tenant-isolation.e2e-spec.ts`, including ten
cross-organization reads each paired with the same read against the caller's
own organization — so a "fix" that simply refused everything would fail.

**`api/src/services/authorization.service.ts:340-513`** (`getSubjectTypes`)

Thirteen branches early-return the subject **class** rather than an entity:

```ts
if (action === 'read' || action === 'create' || action == 'read_all')
  return subject;
```

`PermissionGuard` passes that straight to
`ForbiddenError.from(ability).throwUnlessCan(action, subjectObjects[i])`
(`permission.guard.ts:80`). CASL evaluates a rule's `conditions` against a
subject *instance*; handed a class it can only match the subject type, so the
`{ 'organization.organizationId': ... }` condition on every resource rule is
skipped and the action is permitted.

Consequence: any authenticated member of any organization can read — and
create in — every other organization's coupons, campaigns, coupon codes,
customers, items, redemptions and API keys, simply by putting the foreign
organization id in the path. The summary and report endpoints backed by the
materialized views are exposed the same way.

`update` and `delete` are **not** affected: those branches return a fetched
entity (`fetchCouponForValidation` and friends), so conditions do evaluate.

Bare-class returns are at lines 364, 376, 393, 405, 415, 427, 447, 460, 469,
471, 485, 493 and 506.

Context: the companion defect — resource rules passing the organization scope
as CASL's third positional argument in an *array*, which CASL reads as
`fields` rather than `conditions`, imposing no restriction at all — is
recorded under **Fixed, not separately listed** below. That one closed
`update`/`delete`; this entry was the other half, where the problem was not
the rule but that the guard never gave CASL an instance to test it against.

**Fix:** for these actions return a subject carrying the path's organization
instead of the bare class, so the condition has something to match — e.g.
`Object.assign(new Coupon(), { organization: { organizationId: subjectOrganizationId } })`.
Every branch needs it, and each affected route must be confirmed to actually
carry `organization_id` in its path first. `read_all` needs the same treatment
as `read`.

The regression test that was skipped pending this fix —
*"an admin cannot create an api key for another organization"* in
`api/test/e2e/tenant-isolation.e2e-spec.ts` — now runs and passes. No test in
the suite is skipped any more.

---

## 2. `deactivateCouponCode` turns every error into a 500

**Status: FIXED.** The catch block now rethrows `NotFoundException`,
`ConflictException` and `BadRequestException` before falling back to a 500,
matching its siblings. Deactivating a redeemed or expired code returns 400
with its real message. Covered by *"400s when the code has already been
redeemed"* and *"400s when the code has expired"* in
`api/test/e2e/coupon-code.e2e-spec.ts`.

**`api/src/services/coupon-code.service.ts:546-555`**

The catch block rethrows nothing, so both guarded failures below are replaced by
a generic 500:

```ts
} catch (error) {
  this.logger.error(`Error in deactivateCouponCode:`, error);
  throw new HttpException(
    'Failed to deactivate coupon code',
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}
```

- `NotFoundException('Coupon code not found')` (line 525)
- `BadRequestException('Cannot deactivate a coupon code of status ...')` (line 536)

The 404 is masked in practice — `PermissionGuard` resolves `update` on
`CouponCode` through `fetchCouponCodeForValidation`, which 404s first — but the
400 is fully reachable. Deactivating an already expired or redeemed code
currently reports a server fault rather than the client error it is.

Every sibling method in this file (`reactivateCouponCode` at lines 626-632,
`updateCouponCode` at lines 374-376) has the rethrow guard; this one is just missing it.

**Fix:** add the same guard used at lines 626-632.

---

## 3. `fetchUser` swallows its own 404 and returns `200` with no body

**Status: FIXED.** The catch now rethrows `NotFoundException` and converts
anything else to a 500; the duplicated `if (!user)` check is gone.
`GET /api/users/{user_id}` returns 404 for a user that does not exist.
Covered by *"404s for an unknown user"* in `api/test/e2e/user.e2e-spec.ts`.

**`api/src/services/user.service.ts:573-575`**

```ts
} catch (error) {
  this.logger.error(`Error in fetchUser:`, error);
}
```

There is no rethrow and no return, so the `NotFoundException('User not found')`
thrown at line 568 is caught and discarded, and the method resolves to
`undefined`. `TransformInterceptor` then wraps that into a `200`:

```json
{ "code": 200, "message": "Successfully fetched organization for user", "data": null }
```

`GET /api/users/{user_id}` therefore reports success for a user that does not
exist. Any client that checks the status code before reading `data` will
dereference null.

Related, in the same method: lines 562-564 and 566-569 are duplicate `if (!user)`
checks; the first only logs.

**Fix:** rethrow `NotFoundException` from the catch, and drop the duplicated check.

---

## 4. `updateCustomers` reports unknown customer ids as a 500

**Status: OPEN.**

**`api/src/services/customer-coupon-code.service.ts:250-260`**

The catch rethrows only `NotFoundException`, so the
`BadRequestException('Customer with IDs ... do not exist.')` raised by
`CustomersService.validateCustomersExist` (`customer.service.ts:323`) is
converted to a 500.

`addCustomers` — the sibling method doing the same validation — gets this right
at lines 78-83 by also allowing `error.name === 'BadRequestException'` through.

**Fix:** mirror the `addCustomers` guard.

---

## 5. `PATCH .../coupon-codes/{coupon_code_id}/customers` has no permission check

**Status: FIXED**, though not by restoring the commented-out line.

`@Permissions('update', CouponCode)` could not work here: this controller is
mounted at `/coupons/:coupon_id/...` with no `:organization_id`, and the
`CouponCode` branch of `getSubjectTypes` requires one, so every request would
have raised `BadRequest`. That is the likely reason it was commented out
rather than repaired. The handler now carries
`@Permissions('update', CustomerCouponCode)`, which resolves from the
parameters this path does have — the same subject its sibling delete handler
uses.

Guarding it exposed a second problem: `fetchCustomerForValidation` returns
`null` when the allow-list is empty, and CASL's `detectSubjectType` throws on
`null.constructor`, which `PermissionGuard` turns into a blanket 403. An
organization's own admin was locked out of a coupon code simply because nobody
had been added to it yet. That method now falls back to an unsaved
`CustomerCouponCode` carrying the coupon code and its organization, so the
rule is evaluated against the resource being modified. The same fallback fixes
the delete handler on an empty allow-list.

Covered by four cases in `api/test/e2e/customer-coupon-code.e2e-spec.ts`:
outsider refused, viewer refused, admin can populate an empty allow-list,
outsider still refused when it is empty.

**`api/src/controllers/customer-coupon-code.controller.ts:90`**

```ts
// @Permissions('update', CouponCode)
@Patch()
async updateCustomers(...)
```

The decorator was commented out. `PermissionGuard` returns `true` early when a
handler carries no permission metadata (`permission.guard.ts:51-53`), so any
authenticated caller could replace the customer allow-list on any coupon code
in any organization — the other three handlers on this controller were all
guarded.

This was a security consequence rather than just a wrong status code — see
also issue 1, which left reads unscoped across the whole API and is now
fixed.

**Fix:** restore the decorator, or record why it was removed.

---

## 6. `addItems` has a catch block that can never run

**Status: OPEN.** Cosmetic — the behaviour is accidentally correct.

**`api/src/services/coupon-item.service.ts:32-71`**

```ts
try {
  return this.datasource.transaction(async (manager) => { ... });
} catch (error) { ... }
```

`return` on a promise inside an `async` function does not await it, so a
rejection from the transaction callback never reaches this `try`. The whole
catch — including the `error.name == 'BadRequestException'` special case at line
64 — is dead code.

Behaviour is accidentally correct: the original `NotFoundException` /
`BadRequestException` propagate untouched, which is what the docs describe. The
block is still misleading, and the same shape elsewhere would silently change
behaviour.

Note the contrast with `updateItems` (line 194), where the `try` sits *inside*
the transaction callback and does run.

**Fix:** delete the dead catch, or `return await` if the wrapping was intended.

---

## 7. Leftover debug logging on every permission-checked request

**Status: OPEN.** The highest-value item remaining — it writes bcrypt password
hashes to stdout on every guarded request that resolves a `User` subject.

**`api/src/guards/permission.guard.ts:79`**

```ts
console.log('\n\n', action, subjectObjects[i], '\n\n');
```

Runs inside the permission loop for every guarded request, bypassing
`LoggerService`, and prints the fully hydrated subject entity — which for
`User` subjects includes the bcrypt password hash.

**Fix:** remove it.

Two smaller things in the same file:

- **`permission.guard.ts:99`** — the catch returns `false` instead of throwing,
  so a denied action produces Nest's bare `Forbidden resource` rather than the
  `ForbiddenError` message CASL produced. Harder to debug from the client side.
- **`permission.guard.ts:102`** — `return true` after a `try` block whose every
  path returns is unreachable.

---

## 8. `deleteOrganization` cannot return its own 404

**Status: OPEN.** Masked by `PermissionGuard`; wrong on its own terms.

**`api/src/services/organization.service.ts:255-262`**

Same shape as issue 2: the catch has no `instanceof NotFoundException` rethrow,
so the 404 raised at line 248 becomes a 500.

Lower impact than issue 2 because `PermissionGuard` resolves `delete` on
`Organization` via `fetchOrganization`, which 404s before the service is reached,
so the documented 404 is what clients actually see. The service is still wrong on
its own terms.

---

## 9. `deleteCampaign` never checks that the campaign exists

**Status: OPEN.** Masked by `PermissionGuard`; confirmed at the service level
by *"does not raise for a campaign id that does not exist"* in
`api/test/integration/campaign.service.spec.ts`.

**`api/src/services/campaign.service.ts:482-503`**

The method issues two `manager.update` calls and returns. `UPDATE ... WHERE
campaign_id = $1` matching zero rows is not an error, so deleting a
non-existent campaign succeeds silently.

Again masked by `PermissionGuard` (`delete` on `Campaign` resolves through
`fetchCampaignForValidation`), so the endpoint does 404 today. Worth a guard
anyway — every other `delete*` service method has one.

Also line 483: `'STAART: deleteCampaign service'` typo in the log message.

---

## 10. `updateCampaign` checks the new name against every organization

**Status: OPEN.**

**`api/src/services/campaign.service.ts:254-262`**

`createCampaign` scopes its duplicate-name lookup to the coupon:

```ts
where: { name: Raw(LOWER(...)), status: Not(ARCHIVE), coupon: { couponId } }
```

`updateCampaign` omits that scope entirely:

```ts
where: { name: Raw(LOWER(...)), status: Not(ARCHIVE), campaignId: Not(campaignId) }
```

so a rename collides with a campaign of any coupon, in any organization. A
name that is free to *create* is therefore not always free to *rename onto*,
and the 409 discloses that some unrelated tenant is using it.

Low impact: it leaks a name rather than data, and the failure is a refusal
rather than unauthorized access. Same shape as the item-name defect in
**Fixed, not separately listed** below, which is now corrected — this is the
last instance of that pattern.

**Fix:** add `coupon: { couponId }` to the lookup, matching `createCampaign`.
`updateCampaign(campaignId, body)` does not receive a coupon id, so take it
from the campaign already fetched at the top of the method (load the relation,
as `ItemsService.updateItem` now does).

Documented by *"rejects a rename onto a name used by an unrelated
organization"* in `api/test/integration/campaign.service.spec.ts`, which
asserts the current behaviour and explains the asymmetry.

---

## Fixed, not separately listed

Two defects found by the test suite and fixed in the same pass, recorded here
because neither was ever numbered above.

### CASL organization scope passed as `fields` instead of `conditions`

**`api/src/services/authorization.service.ts`**

Every resource rule for ADMIN, EDITOR, VIEWER and `getApiUserAbility` passed
the organization scope as CASL's third positional argument in an array:

```ts
allow('manage', [Coupon, Campaign, ...], ['organization.organizationId']);
```

CASL reads an array there as `fields`, not `conditions`, so the rule meant
"may manage these subjects in **any** organization". An admin of one
organization could archive another organization's coupons, campaigns, coupon
codes, customers, items, redemptions and API keys.

Fixed by passing conditions through a helper, `inOrganization(path, id)`,
which also documents the trap. Two rules that had *no* scope at all were
tightened to match their siblings: EDITOR's `manage CustomerCouponCode` and
VIEWER's `read Organization`. `CustomersService.fetchCustomerForValidation`
and `ApiKeyService.fetchApiKey` gained `relations: { organization: true }` —
without the relation loaded the new condition compares against `undefined` and
locks out legitimate members.

This closed `update` and `delete`. Issue 1 is the remaining half.

Held by `api/test/e2e/tenant-isolation.e2e-spec.ts` (11 cases across items,
customers, campaigns, api keys and coupons, each checked both ways: the
organization's own members still have access, foreign ones do not) and by the
tenant-isolation case in `api/test/e2e/coupon-authorization.e2e-spec.ts`.

### Item names were unique across the whole deployment

**`api/src/services/item.service.ts`**

`createItem` checked for a duplicate name with no organization predicate:

```ts
where: { name: ILike(body.name), status: ACTIVE }
```

so one tenant naming an item "Laptop" permanently blocked every other tenant
from doing the same, and the 409 disclosed that the name was taken.
`updateItem` carried the identical defect in a raw query builder
(`LOWER(item.name) = LOWER(:name) AND status = 'active' AND item_id != :itemId`),
so renames were blocked cross-tenant too. `upsertItem` was already correct.

Both now scope to the organization. `updateItem` takes no `organizationId`, so
it uses the organization of the item being edited — the right scope anyway —
and its raw SQL was replaced with the `Raw(LOWER(...))` + `Not(itemId)` form
`CouponService.updateCoupon` already uses.

Held by six cases in `api/test/integration/item.service.spec.ts` and two in
`api/test/e2e/item.e2e-spec.ts`.

---

## Notes

- **Non-`HttpException` failures bypass the response envelope.**
  `HttpExceptionFilter` (`api/src/exceptionFilters/globalExceptionFilter.ts:8`)
  is declared `@Catch(HttpException)`, so anything else falls through to Nest's
  default handler and returns `{ "statusCode": 500, "message": "Internal server
  error" }` — note `statusCode`, not the `code` every other error uses. Most
  services convert to `HttpException` in a catch, so this mainly affects the
  three streaming report endpoints, which have no catch at all. Documented as
  such in the spec.

- **Validation errors lose their detail.** `api/src/app-setup.ts:37` builds
  `new BadRequestException(errors)` from an array. `HttpException.initMessage()`
  only lifts a string, or an object with a string `message`, so the array is
  dropped and the client receives the literal `"Bad Request Exception"` with no
  indication of which field failed. The array is `console.error`'d server-side at
  line 36 but never returned. Passing `{ message: errors }` instead would
  surface it.

  (This moved out of `main.ts` into `app-setup.ts` so the test harness boots an
  app configured identically to production; the behaviour is unchanged.)

- **Endpoints still undocumented in `resources/openapi.json`:**
  `GET /api/users/{user_id}/organizations` and `GET /api/super-admin/exists`.
  The summary and report endpoints were added; these two were not.
