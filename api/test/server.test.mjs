//tools
import request from 'supertest';
import { expect } from 'chai';

//server
const mainServerUrl = "http://localhost:4000";
const authServerUrl = "http://localhost:5000";

let budgetTest = {
    name: 'testBudget',
    base_balance: 100,
    is_default: true
}

function transactionTest (budget_id, title) {
    return {
        budget_id,
        type: 'income',
        amount: 10,
        date: new Date(),
        title
    }
}

async function myFetch(baseUrl, type, url, expectedStatus, token, body = {}) {
    return type === 'GET' ? (
        await request(baseUrl)
        .get(url)
        .set('Authorization', `Bearer ${token}`)
        .send()
        .expect(expectedStatus)
    ) : type === 'POST' ? (
        await request(baseUrl)
        .post(url)
        .send(body)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(expectedStatus)
    ) : type === 'PUT' ? (
        await request(baseUrl)
        .put(url)
        .send(body)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(expectedStatus)
    ) :
    ''
}

describe("server test", () => {

    const testUser = {
        email: 'test@example.com',
        password: 'Password123'
    };
    let loginRes;

    beforeEach(async () => {
        await request(mainServerUrl)
        .get('/test/db/reset')
        .expect(200)
        loginRes = await myFetch( authServerUrl, 'POST', '/login', 200, '', testUser )
    });

    describe("not requires budget", () => {

        it("should return error for invalid budget id in budget-list route", async () => {
            const res = await myFetch( mainServerUrl, 'GET', '/budget/invalidBudgetId/list', 400, loginRes.body.accessToken.token )
            expect(res.body.error).to.equal('Invalid budget id');
        })

        it("should return error for any invalid request in budget post route", async () => {
            const res1 = await myFetch( mainServerUrl, 'POST', '/budget', 400, loginRes.body.accessToken.token, { ...budgetTest, base_balance: 'asdasd' } )
            expect(res1.body.error).to.equal('Invalid value');

            const res2 = await myFetch( mainServerUrl, 'POST', '/budget', 400, loginRes.body.accessToken.token, { ...budgetTest, is_default: '123' } )
            expect(res2.body.error).to.equal('Invalid value');
        })

        it("should return error for invalid budget id in transactions route", async () => {
            const res = await myFetch( mainServerUrl, 'GET', '/budget/invalidBudgetId/transactions', 400, loginRes.body.accessToken.token )
            expect(res.body.error).to.equal('Invalid budget id');
        })

        it("should response with 403 if user doesn't have the budget", async () => {
            const res = await myFetch( mainServerUrl, 'GET', '/budget/71F2155B38D1CBDCDA7D54CC/list', 403, loginRes.body.accessToken.token )
            expect(res.body).not.have.property('currentBudget')
            expect(res.body).not.have.property('list')
        })

    })

    describe("requires a budget", () => {

        let budgetRes;

        beforeEach(async () => {
            budgetRes = await myFetch( mainServerUrl, 'POST', '/budget', 200, loginRes.body.accessToken.token,budgetTest, budgetTest )
        });

        it("should return error for any invalid request in transaction post route", async () => {
            const validTransaction = transactionTest(budgetRes.body.budget._id, 'testTransaction')

            const res1 = await myFetch( mainServerUrl, 'POST', '/transaction', 400, loginRes.body.accessToken.token, { ...validTransaction, budget_id: 'invalidMongoId' } )
            expect(res1.body.error).to.equal('Invalid value');

            const res2 = await myFetch( mainServerUrl, 'POST', '/transaction', 400, loginRes.body.accessToken.token, { ...validTransaction, amount: 'invalid' } )
            expect(res2.body.error).to.equal('Invalid value');
        })

        it("response should include default budget id", async () => {
            const res = await myFetch( mainServerUrl, 'GET', '/budget/default/id', 200, loginRes.body.accessToken.token )
            expect(res.body.budget_id).to.equal(budgetRes.body.budget._id)
        })

        it("should create transaction", async () => {
            const res = await myFetch ( mainServerUrl, 'POST', '/transaction', 200, loginRes.body.accessToken.token, transactionTest(budgetRes.body.budget._id, 'testTransaction') )
            expect(res.body.transaction._id).to.exist
            const budgetData = ( await myFetch( mainServerUrl, 'GET', `/budget/${budgetRes.body.budget._id}/list`, 200, loginRes.body.accessToken.token ) ).body.currentBudget
            expect( budgetData.transaction_ids[0] ).to.equal(res.body.transaction._id)
            expect( budgetData.categories.length ).to.equal(1)
            expect( budgetData.current_balance ).to.equal(110)

        })

        describe("requires a transaction", function () {

            let transactionRes;

            beforeEach(async () => {
                transactionRes = await myFetch ( mainServerUrl, 'POST', '/transaction', 200, loginRes.body.accessToken.token, transactionTest(budgetRes.body.budget._id, 'testTransaction_2') )
            });

            it("should return error for any invalid request in transaction put route", async () => {
                const res1 = await myFetch(mainServerUrl, 'PUT', '/transaction/invalidTransactionId', 400, loginRes.body.accessToken.token)
                expect(res1.body.error).to.equal('Invalid transaction id');

                const res2 = await myFetch(mainServerUrl, 'PUT', `/transaction/${transactionRes.body.transaction._id}`, 400, loginRes.body.accessToken.token)
                expect(res2.body.error).to.equal('No field provided');

                const res3 = await myFetch(mainServerUrl, 'PUT', `/transaction/${transactionRes.body.transaction._id}`, 400, loginRes.body.accessToken.token, {
                    budget_id: 'invalid',
                    amount: 100,
                })
                expect(res3.body.error).to.equal('Invalid budget id');

                const res4 = await myFetch(mainServerUrl, 'PUT', `/transaction/${transactionRes.body.transaction._id}`, 400, loginRes.body.accessToken.token, {
                    budget_id: budgetRes.body.budget._id,
                    amount: 'invalid',
                })
                expect(res4.body.error).to.equal('Invalid value');
            })

            it("should return error for invalid budget id in transactions delete route", async () => {
                const res = await request(mainServerUrl)
                    .delete('/transaction/invalidTransactionId')
                    .set('Authorization', `Bearer ${loginRes.body.accessToken.token}`)
                    .send()
                    .expect(400)
                expect(res.body.error).to.equal('Invalid transaction id');
            })

            it("should change the title/amount/category of the transaction", async () => {

                await myFetch(mainServerUrl, 'PUT', `/transaction/${transactionRes.body.transaction._id}`, 200, loginRes.body.accessToken.token, {
                    title: 'newTitle',
                })
                await myFetch(mainServerUrl, 'PUT', `/transaction/${transactionRes.body.transaction._id}`, 200, loginRes.body.accessToken.token, {
                    budget_id: budgetRes.body.budget._id,
                    amount: 20,
                })
                await myFetch(mainServerUrl, 'PUT', `/transaction/${transactionRes.body.transaction._id}`, 200, loginRes.body.accessToken.token, {
                    budget_id: budgetRes.body.budget._id,
                    category: 'newCategory',
                })
                await myFetch(mainServerUrl, 'PUT', `/transaction/${transactionRes.body.transaction._id}`, 200, loginRes.body.accessToken.token, {
                    date: 'newDate',
                })

                const updatedTransaction = ( await myFetch( mainServerUrl, 'GET', `/transaction/${transactionRes.body.transaction._id}`, 200, loginRes.body.accessToken.token ) ).body.transaction
                const updatedBudget = ( await myFetch( mainServerUrl, 'GET', `/budget/${budgetRes.body.budget._id}/list`, 200, loginRes.body.accessToken.token ) ).body.currentBudget

                expect(updatedTransaction.title).to.equal('newTitle')
                expect(updatedTransaction.amount).to.equal(20)
                expect(updatedTransaction.category).to.equal('newCategory')
                expect(updatedTransaction.date).to.equal('newDate')

                expect(updatedBudget.current_balance).to.equal(budgetRes.body.budget.base_balance + 20)
                expect(updatedBudget.categories).includes('newCategory')

            })

            it("should delete the transaction", async () => {
                await request(mainServerUrl)
                .delete(`/transaction/${transactionRes.body.transaction._id}`)
                .set('Authorization', `Bearer ${loginRes.body.accessToken.token}`)
                .send()
                .expect(200)

                await myFetch( mainServerUrl, 'GET', `/transaction/${transactionRes.body.transaction._id}`, 403, loginRes.body.accessToken.token )

                const transactionsInBudget = ( await myFetch( mainServerUrl, 'GET', `/budget/${budgetRes.body.budget._id}/transactions`, 200, loginRes.body.accessToken.token ) ).body.transactions

                expect( transactionsInBudget.some(t => t._id === transactionRes.body.transaction._id) )
                .to
                .be
                .false

                expect( ( await myFetch( mainServerUrl, 'GET', `/budget/${budgetRes.body.budget._id}/list`, 200, loginRes.body.accessToken.token ) ).body.currentBudget.current_balance )
                .to
                .equal(budgetRes.body.budget.base_balance)
            })

        })

        describe("requires multiple transactions", () => {

            beforeEach(async () => {

                await Promise.all(['transaction_1', 'transaction_2', 'transaction_3'].map(async (title) => {
                    await myFetch ( mainServerUrl, 'POST', '/transaction', 200, loginRes.body.accessToken.token, transactionTest(budgetRes.body.budget._id, title) )
                }))
                
            });

            it("budget should has the transactions", async () => {
                const transactionsRes = await myFetch ( mainServerUrl, 'GET', `/budget/${budgetRes.body.budget._id}/transactions`, 200, loginRes.body.accessToken.token )    
                expect(transactionsRes.body.transactions.length).to.equal(3)
            })

        })
    })

    describe("requires multiple budget", () => {

        var budgetRes;

        beforeEach(async () => {
            for ( const name of ['budget_1', 'budget_2', 'budget_3'] ) {
                const res = await myFetch ( mainServerUrl, 'POST', '/budget', 200, loginRes.body.accessToken.token,{ ...budgetTest, name } )
                if (name === 'budget_1') {
                    budgetRes = res
                }
            }
        });

        it("response should include all budgets user has", async () => {
            const res = await myFetch ( mainServerUrl, 'GET', `/budget/${budgetRes.body.budget._id}/list`, 200, loginRes.body.accessToken.token ) 
            expect(res.body.currentBudget._id).to.equal(budgetRes.body.budget._id)
            expect(res.body.list.length).to.equal(3)
        })

    })

})