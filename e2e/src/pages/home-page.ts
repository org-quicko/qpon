import { expect, type Locator, type Page } from '@playwright/test';
import type { MemberRole } from '../env';

/**
 * The app renders long before the last of its assets settles, and one of them
 * can hang — so stop at the markup and let `whenReady` decide when the page is
 * actually usable.
 */
const NAVIGATION = { waitUntil: 'domcontentloaded' } as const;

/**
 * Base for the pages inside the app shell, at /:organization_id/home/...
 *
 * Abilities are applied at the moment the header resolves the organization, so
 * acting any earlier can hit an ability set that hasn't loaded yet. Every page
 * therefore waits for the header to name the signed-in role before handing
 * control back — on first load and again after the app navigates itself.
 */
export abstract class HomePage {
  constructor(
    protected readonly page: Page,
    private readonly role: MemberRole,
  ) {}

  /** Resolves once the header confirms the signed-in role. */
  async whenReady(): Promise<void> {
    await expect(this.page.getByText(new RegExp(`You.re the ${this.role}`))).toBeVisible();
  }

  protected async open(path: string): Promise<void> {
    await this.page.goto(path, NAVIGATION);
    await this.whenReady();
  }

  /** The table row showing `name`. */
  row(name: string): Locator {
    return this.page.getByRole('row').filter({ hasText: name });
  }

  /**
   * Reloads until `locator` shows up.
   *
   * Campaigns are read out of a materialized view the API refreshes on a
   * timer, so a change made a moment ago is not in it yet — and these pages
   * fetch once and do not poll, so waiting alone never resolves it.
   */
  async reloadUntilVisible(locator: Locator): Promise<void> {
    await expect(async () => {
      await this.page.reload(NAVIGATION);
      await expect(locator).toBeVisible({ timeout: 2_000 });
    }).toPass({ timeout: 30_000 });
    await this.whenReady();
  }

  /**
   * Reloads until the row showing `name` turns up and, when `text` is given,
   * until that row says it.
   */
  async reloadUntilRow(name: string, text?: string): Promise<void> {
    const row = this.row(name);
    await this.reloadUntilVisible(text === undefined ? row : row.filter({ hasText: text }));
  }

  /** Picks an entry out of the overflow menu of the row showing `name`. */
  async chooseRowAction(name: string, action: string): Promise<void> {
    await this.page.getByRole('button', { name: `Actions for ${name}` }).click();
    await this.page.getByRole('menuitem', { name: action }).click();
  }
}
