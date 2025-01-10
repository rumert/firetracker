import { test, expect } from '@playwright/test';

const auth_url = process.env.NEXT_PUBLIC_AUTH_API_URL

test.describe('Register', () => {
  test.beforeEach(async ({ request }) => {
    const resetRes = await request.post(`${auth_url}/reset`);
    if (!resetRes.ok()) {
      throw new Error('Failed to reset database');
    }

    // const seedResponse = await request.post(`${auth_url}/seed`);
    // if (!seedResponse.ok()) {
    //   throw new Error('Failed to seed database');
    // }
  });

  test.describe('not requires user', () => {
    test.beforeEach(async ({ request }) => {
    });
  
    test('should redirect to create budget on successful register', async ({ page }) => {
      await page.goto('http://localhost:3000/register');
      await page.getByLabel('Nickname').fill('test');
      await page.getByLabel('Email').fill('test@test.com');
      await page.getByLabel('Password').fill('Test123');
      await page.getByRole('button', { name: 'Sign Up' }).click();
    
      const locator = page.getByRole('heading', { name: 'Create budget' });
      await expect(locator).toBeVisible()
    });
    
    test('should throw error for invalid email', async ({ page }) => {
      await page.goto('http://localhost:3000/register');
      await page.getByLabel('Nickname').fill('test');
      await page.getByLabel('Email').fill('test');
      await page.getByLabel('Password').fill('Test123');
      await page.getByRole('button', { name: 'Sign Up' }).click();

      const locator = page.getByText('Invalid email')
      await expect(locator).toBeVisible()
      
    });
  });
});
