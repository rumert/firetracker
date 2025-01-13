import { test, expect } from '@playwright/test';

test.describe('Budget', () => {
    let token: string;
    test.beforeEach(async ({ page, request, browser }) => {
        const resetRes = await request.get(`${process.env.MAIN_API_URL}/db/reset`);
        if (!resetRes.ok()) {
            throw new Error('Failed to reset main database');
        }

        await page.goto(`${process.env.APP_URL}/register`);
        await page.getByLabel('Nickname').fill('test123');
        await page.getByLabel('Email').fill('test@test.com');
        await page.getByLabel('Password').fill('Test123');
        await page.getByRole('button', { name: 'Sign Up' }).click();

        await page.waitForURL(`${process.env.APP_URL}`);
        await page.context().storageState({ path: 'auth.json' });

        await page.getByLabel('Budget Name').fill('test budget')
        await page.getByLabel('Base Balance ( $ )').fill('0');
        await page.getByRole('button', { name: 'Create' }).click();

        const loginRes = await request.post(`${process.env.AUTH_API_URL}/login`, {
            headers: {
                'Content-type': 'application/json'
            },
            data: JSON.stringify({
                nickname: 'test123',
                password: 'Test123'
            }),
        });
        if (!loginRes.ok()) {
            throw new Error('Failed to login');
        }
        token = ( await loginRes.json() ).accessToken
    });

    test.describe('not requires budget/transaction', () => {
        
        test('should create a new budget and redirect to its page', async ({ page, browser }) => {
            await browser.newContext({ storageState: 'auth.json' });
            await page.goto(`${process.env.APP_URL}`);
            await page.locator('button[data-pw="createBudgetButton"]').click();
           
            await page.getByLabel('Budget Name').fill('new budget')
            await page.getByLabel('Base Balance ( $ )').fill('0');
            await page.getByRole('button', { name: 'Create' }).click();
            
            const locator_1 = page.getByText('No Transactions Yet')
            const locator_2 = page.getByText('new budget')
            await expect(locator_1).toBeVisible()
            await expect(locator_2).toBeVisible()
        });

        test('should create a new transaction and display it correctly', async ({ page, browser }) => {
            await page.locator('button[data-pw="addTransactionButton"]').click();
            await page.getByLabel('Where Did You Spent?').fill('school');
            await page.getByLabel('Amount ($)').fill('30');
            await page.getByLabel('Date').click();
            await page.getByRole('gridcell', { name: '23' }).click();
            await page.getByRole('button', { name: 'Add' }).click();

            const locator_1 = page.getByRole('button', { name: 'school' })
            const locator_2 = page.getByRole('button', { name: '-$30.00' })
            const locator_3 = page.getByRole('cell', { name: '/23' }).locator('div')
            const locator_4 = page.locator('p').filter({ hasText: 'school' })
            const locator_5 = page.locator('p').filter({ hasText: '-$30.00' })
            const locator_6 = page.locator('p').filter({ hasText: '/23' })
            
            await expect(locator_1).toBeVisible()
            await expect(locator_2).toBeVisible()
            await expect(locator_3).toBeVisible()
            await expect(locator_4).toBeVisible()
            await expect(locator_5).toBeVisible()
            await expect(locator_6).toBeVisible()
        });
        
    });

    test.describe('requires multiple budgets and transactions', () => {

        test.beforeEach(async ({ request }) => {
            const seedRes = await request.get(`${process.env.MAIN_API_URL}/db/seed`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!seedRes.ok()) {
                throw new Error('Failed to seed database');
            }
        });
        
        test('', async ({ }) => {
            
        });
        
    });

});
