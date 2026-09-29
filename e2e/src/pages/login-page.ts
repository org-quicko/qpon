import type { Locator, Page } from '@playwright/test';
import type { Credentials } from '../env';

/**
 * The login form at /login. Most tests skip it — the fixtures hand the browser
 * the cookie a successful login would set — so reaching it needs
 * `test.use({ signedIn: false })`.
 */
export class LoginPage {
  readonly email: Locator;
  readonly password: Locator;
  readonly logInButton: Locator;

  constructor(private readonly page: Page) {
    this.email = page.getByLabel('Email');
    this.password = page.getByLabel('Password');
    this.logInButton = page.getByRole('button', { name: 'Log in' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/login', { waitUntil: 'domcontentloaded' });
  }

  async logIn(user: Pick<Credentials, 'email' | 'password'>): Promise<void> {
    await this.email.fill(user.email);
    await this.password.fill(user.password);
    await this.logInButton.click();
  }
}
