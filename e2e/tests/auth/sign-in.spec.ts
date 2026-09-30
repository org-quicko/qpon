import { credentials } from '../../src/env';
import { expect, test } from '../../src/fixtures';

/**
 * Every other test is handed the cookie a successful login sets, so this is
 * the only place the login form itself is exercised.
 */
test.describe('Signing in', () => {
  test.use({ signedIn: false });

  test('an unauthenticated visitor is sent to the login form', async ({ page }) => {
    await page.goto('/organizations', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(new RegExp('/login$'));
    await expect(page.getByText('Login to your account')).toBeVisible();
  });

  test('the right credentials land on the organization picker', async ({
    organization,
    loginPage,
    organizationsPage,
  }) => {
    await loginPage.goto();

    await loginPage.logIn(credentials.members.admin);

    await expect(organizationsPage.heading).toBeVisible();
    await expect(organizationsPage.organization(organization.name)).toBeVisible();
  });

  test('the wrong password is refused', async ({ page, loginPage }) => {
    await loginPage.goto();

    await loginPage.logIn({
      email: credentials.members.admin.email,
      password: 'NotThePassword#1',
    });

    await expect(page.getByText('Invalid credentials')).toBeVisible();
    await expect(page).toHaveURL(new RegExp('/login$'));
  });

  test('an unknown email is refused', async ({ page, loginPage }) => {
    await loginPage.goto();

    await loginPage.logIn({ email: 'nobody@qpon.test', password: 'NotThePassword#1' });

    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });

  test('both fields are required', async ({ page, loginPage }) => {
    await loginPage.goto();

    await loginPage.logInButton.click();

    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('the email has to look like an email', async ({ page, loginPage }) => {
    await loginPage.goto();

    await loginPage.email.fill('not-an-email');
    await loginPage.password.fill('NotThePassword#1');
    await loginPage.logInButton.click();

    await expect(page.getByText('Invalid email')).toBeVisible();
    await expect(page).toHaveURL(new RegExp('/login$'));
  });
});
