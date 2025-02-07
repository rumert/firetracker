import { test, expect } from '@playwright/test';

test.describe('Create Budget', () => {
    test.beforeEach(async ({ request, page }) => {
        const resetRes = await request.get(`${process.env.NEXT_PUBLIC_MAIN_API_URL}/db/reset`);
        if (!resetRes.ok()) {
            throw new Error('Failed to reset database');
        }
        await page.goto(`${process.env.NEXT_PUBLIC_APP_URL}/register`);
        await page.getByLabel('Nickname').fill('test123');
        await page.getByLabel('Email').fill('test@test.com');
        await page.getByLabel('Password').fill('Test123');
        await page.getByRole('button', { name: 'Sign Up' }).click();

        await page.waitForURL(`${process.env.NEXT_PUBLIC_APP_URL}`);
        await page.context().storageState({ path: 'auth.json' });
    });

    test('should redirect to budget page on successful creation', async ({ browser, page }) => {
        await browser.newContext({ storageState: 'auth.json' });

        await page.goto(`${process.env.NEXT_PUBLIC_APP_URL}`);
        await page.getByLabel('Budget Name').fill('test budget')
        await page.getByLabel('Base Balance ( $ )').fill('1');
        await page.getByRole('button', { name: 'Create' }).click();
        const url = new RegExp(`${process.env.NEXT_PUBLIC_APP_URL}/budget/[a-f\\d]{24}`);
        await page.waitForURL(url);
        
        const locator_1 = page.getByText('No Transactions Yet')
        const locator_2 = page.getByText('test budget')
        await expect(locator_1).toBeVisible()
        await expect(locator_2).toBeVisible()
    });
    
});
