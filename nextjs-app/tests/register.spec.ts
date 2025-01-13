import { test, expect } from '@playwright/test';

test.describe('Register', () => {
  test.beforeEach(async ({ request }) => {
    const resetRes = await request.get(`${process.env.AUTH_API_URL}/db/reset`);
    if (!resetRes.ok()) {
      throw new Error('Failed to reset database');
    }
  });

  test.describe('not requires user', () => {
  
    test('should redirect to create budget on successful register', async ({ page }) => {
      await page.goto(`${process.env.APP_URL}/register`);
      await page.getByLabel('Nickname').fill('test123');
      await page.getByLabel('Email').fill('test@test.com');
      await page.getByLabel('Password').fill('Test123');
      await page.getByRole('button', { name: 'Sign Up' }).click();
    
      const locator = page.getByRole('heading', { name: 'Create budget' });
      await expect(locator).toBeVisible()
    });
    
    test('should display error for invalid email', async ({ page }) => {
      await page.goto(`${process.env.APP_URL}/register`);
      await page.getByLabel('Nickname').fill('test123');
      await page.getByLabel('Email').fill('invalid');
      await page.getByLabel('Password').fill('Test123');
      await page.getByRole('button', { name: 'Sign Up' }).click();

      const locator = page.getByText('Invalid email')
      await expect(locator).toBeVisible()
      
    });

    test('should display error for invalid password', async ({ page }) => {
      await page.goto(`${process.env.APP_URL}/register`);
      await page.getByLabel('Nickname').fill('test123');
      await page.getByLabel('Email').fill('test@test.com');
      await page.getByLabel('Password').fill('invalid');
      await page.getByRole('button', { name: 'Sign Up' }).click();

      const locator = page.getByText('Password must contain at least a number and an uppercase letter')
      await expect(locator).toBeVisible()
      
    });
  });

  test.describe('requires user', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${process.env.APP_URL}/register`);
      await page.getByLabel('Nickname').fill('test123');
      await page.getByLabel('Email').fill('test@test.com');
      await page.getByLabel('Password').fill('Test123');
      await page.getByRole('button', { name: 'Sign Up' }).click();

      await page.waitForURL(`${process.env.APP_URL}`);
      await page.context().storageState({ path: 'auth.json' });
    });

    test('should redirect to homepage if already authenticated', async ({ browser, page }) => {
      await browser.newContext({ storageState: 'auth.json' });
      await page.goto(`${process.env.APP_URL}/register`);
      await page.waitForURL(`${process.env.APP_URL}`);
    });
    
  });
});
