import { test, expect } from '@playwright/test';

test.describe('Login', () => {
    test.beforeEach(async ({ request }) => {
        const resetRes = await request.get(`${process.env.NEXT_PUBLIC_MAIN_API_URL}/db/reset`);
        if (!resetRes.ok()) {
            throw new Error('Failed to reset database');
        }
        const registerRes = await request.post(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/register`, {
            data: {
                nickname: "test123",
                email: "test@test.com",
                password: "Test123"
            }
        });
        if (!registerRes.ok()) {
            throw new Error('Failed to register');
        }
    });

    test.describe('not requires budget', () => {
        
        test('should redirect to create budget on successful login', async ({ page }) => {
            await page.goto(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
            await page.getByLabel('Nickname').fill('test123');
            await page.getByLabel('Password').fill('Test123');
            await page.getByRole('button', { name: 'Login' }).click();
        
            const locator = page.getByRole('heading', { name: 'Create budget' });
            await expect(locator).toBeVisible()
        });

        test('should display error for non-existent nickname', async ({ page }) => {
            await page.goto(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
            await page.getByLabel('Nickname').fill('not exist');
            await page.getByLabel('Password').fill('Test123');
            await page.getByRole('button', { name: 'Login' }).click();
    
            const locator = page.getByText('No user with this nickname found.')
            await expect(locator).toBeVisible()
        });

        test('should display error for wrong password', async ({ page }) => {
            await page.goto(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
            await page.getByLabel('Nickname').fill('test123');
            await page.getByLabel('Password').fill('wrongpass');
            await page.getByRole('button', { name: 'Login' }).click();
    
            const locator = page.getByText('Wrong password')
            await expect(locator).toBeVisible()
        });
        
    });

    test.describe('requires budget', () => {
        
        test.beforeEach(async ({ page }) => {
            await page.goto(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
            await page.getByLabel('Nickname').fill('test123');
            await page.getByLabel('Password').fill('Test123');
            await page.getByRole('button', { name: 'Login' }).click();
            await page.waitForURL(`${process.env.NEXT_PUBLIC_APP_URL}`);
            await page.context().storageState({ path: 'auth.json' });

            await page.getByLabel('Budget Name').fill('test budget')
            await page.getByLabel('Base Balance ( $ )').fill('1');
            await page.getByRole('button', { name: 'Create' }).click();
            const url = new RegExp(`${process.env.NEXT_PUBLIC_APP_URL}/budget/[a-f\\d]{24}`);
            await page.waitForURL(url);
        });
    
        test('should redirect to default budget page on login', async ({ browser, page }) => {
            await browser.newContext({ storageState: 'auth.json' });
            await page.goto(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
            
            const locator = page.getByText('No Transactions Yet')
            await expect(locator).toBeVisible()
        });
        
    });

});
