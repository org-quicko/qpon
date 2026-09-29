import type { Locator, Page } from '@playwright/test';

/**
 * The chrome the app's full-screen flows share: a bar pinned to the bottom
 * whose primary button reads "Next" until the last step, where it reads
 * "Save". Both names point at the same button, so a step that saves is written
 * with `saveButton` and one that advances with `nextButton` — which is also how
 * the flow reads on screen.
 */
export abstract class Wizard {
  readonly nextButton: Locator;
  readonly backButton: Locator;
  readonly saveButton: Locator;
  readonly exitButton: Locator;

  constructor(protected readonly page: Page) {
    // Exact, so an open date picker's "Next month" is not mistaken for the bar.
    this.nextButton = page.getByRole('button', { name: 'Next', exact: true });
    this.backButton = page.getByRole('button', { name: 'Back', exact: true });
    this.saveButton = page.getByRole('button', { name: 'Save', exact: true });
    this.exitButton = page.getByRole('button', { name: 'Exit', exact: true });
  }

  /**
   * One of the big tile-shaped choices, e.g. "Percentage" or "Unlimited
   * budget", addressed by the title a user reads on it.
   *
   * Each tile is a radio button whose dot the design hides with
   * `display: none`, which takes the control out of the accessibility tree
   * altogether — so there is no radio to select by role, and no checked state
   * to assert on. The tile is what a user sees and clicks.
   */
  protected choice(title: string): Locator {
    return this.page.getByText(title, { exact: true });
  }
}
