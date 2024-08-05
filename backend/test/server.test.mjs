
//database
import mongoose from 'mongoose';
import User from '../src/models/user.js';
import Budget from '../src/models/budget.js';
import Transaction from '../src/models/transaction.js'

//tools
import request from 'supertest';
import { expect } from 'chai';

//server
import { app } from '../src/servers/server.js';
import { app as authApp } from '../src/servers/authServer.js';
import connectDB from '../src/config/db.js';

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

async function myFetch(server, type, url, expectedStatus, token, body = {}) {
    return type === 'GET' ? (
        await request(server)
        .get(url)
        .set('Authorization', `Bearer ${token}`)
        .send()
        .expect(expectedStatus)
    ) : type === 'POST' ? (
        await request(server)
        .post(url)
        .send(body)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(expectedStatus)
    ) : type === 'PUT' ? (
        await request(server)
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
        await mongoose.connection.db.dropDatabase()
        loginRes = await myFetch( authApp, 'POST', '/login', 200, '', testUser )
    });

    before(async () => {
        await connectDB()
        if (!mongoose.connection.db) {
            await new Promise((resolve) => {
                mongoose.connection.on('connected', resolve);
            });
        }
    });

    after(async () => {
        await mongoose.connection.close();
    });

    describe("not requires budget", () => {

        it("should return error for invalid budget id in budget-list route", async () => {
            const res = await myFetch( app, 'GET', '/budget/invalidBudgetId/list', 400, loginRes.body.accessToken.token )
            expect(res.body.error).to.equal('Invalid budget id');
        })

        it("should return error for any invalid request in budget post route", async () => {
            const res1 = await myFetch( app, 'POST', '/budget', 400, loginRes.body.accessToken.token, { ...budgetTest, base_balance: 'asdasd' } )
            expect(res1.body.error).to.equal('Invalid value');

            const res2 = await myFetch( app, 'POST', '/budget', 400, loginRes.body.accessToken.token, { ...budgetTest, is_default: '123' } )
            expect(res2.body.error).to.equal('Invalid value');
        })

        it("should return error for invalid budget id in transactions route", async () => {
            const res = await myFetch( app, 'GET', '/budget/invalidBudgetId/transactions', 400, loginRes.body.accessToken.token )
            expect(res.body.error).to.equal('Invalid budget id');
        })

        it("should response with 403 if user doesn't have the budget", async () => {
            const res = await myFetch( app, 'GET', '/budget/71F2155B38D1CBDCDA7D54CC/list', 403, loginRes.body.accessToken.token )
            expect(res.body).not.have.property('currentBudget')
            expect(res.body).not.have.property('list')
            const user_id = ( await User.findOne({ email: 'test@example.com' }) )._id
            expect( (await Budget.find({ user_id })).length ).to.equal(0)
        })

    })

    describe("requires a budget", () => {

        let budgetRes;

        beforeEach(async () => {
            budgetRes = await myFetch( app, 'POST', '/budget', 200, loginRes.body.accessToken.token,budgetTest, budgetTest )
        });

        it("should return error for any invalid request in transaction post route", async () => {
            const validTransaction = transactionTest(budgetRes.body.budget._id, 'testTransaction')

            const res1 = await myFetch( app, 'POST', '/transaction', 400, loginRes.body.accessToken.token, { ...validTransaction, budget_id: 'invalidMongoId' } )
            expect(res1.body.error).to.equal('Invalid value');

            const res2 = await myFetch( app, 'POST', '/transaction', 400, loginRes.body.accessToken.token, { ...validTransaction, amount: 'invalid' } )
            expect(res2.body.error).to.equal('Invalid value');
        })

        it("response should include default budget id", async () => {
            const res = await myFetch( app, 'GET', '/budget/default/id', 200, loginRes.body.accessToken.token )
            expect(res.body.budgetId).to.equal(budgetRes.body.budget._id)
        })

        it("should create transaction", async () => {
            const res = await myFetch ( app, 'POST', '/transaction', 200, loginRes.body.accessToken.token, transactionTest(budgetRes.body.budget._id, 'testTransaction') )
            expect(res.body.transaction._id).to.equal( (await Transaction.findOne({ title: 'testTransaction' })).id )
            const budgetData = (await Budget.findOne({ name: 'testBudget' }))
            expect( budgetData.transaction_ids[0] ).to.equal(res.body.transaction._id)
            expect( budgetData.categories.length ).to.equal(1)
            expect( budgetData.current_balance ).to.equal(110)

        })

        describe("requires a transaction", () => {

            let transactionRes;

            beforeEach(async () => {
                transactionRes = await myFetch ( app, 'POST', '/transaction', 200, loginRes.body.accessToken.token, transactionTest(budgetRes.body.budget._id, 'testTransaction') )
            });

            it("should return error for any invalid request in transaction put route", async () => {
                const res1 = await myFetch(app, 'PUT', '/transaction/invalidTransactionId', 400, loginRes.body.accessToken.token)
                expect(res1.body.error).to.equal('Invalid transaction id');

                const res2 = await myFetch(app, 'PUT', `/transaction/${transactionRes.body.transaction._id}`, 400, loginRes.body.accessToken.token)
                expect(res2.body.error).to.equal('No field provided');

                const res3 = await myFetch(app, 'PUT', `/transaction/${transactionRes.body.transaction._id}`, 400, loginRes.body.accessToken.token, {
                    budget_id: 'invalid',
                    amount: 100,
                })
                expect(res3.body.error).to.equal('Invalid budget id');

                const res4 = await myFetch(app, 'PUT', `/transaction/${transactionRes.body.transaction._id}`, 400, loginRes.body.accessToken.token, {
                    budget_id: budgetRes.body.budget._id,
                    amount: 'invalid',
                })
                expect(res4.body.error).to.equal('Invalid value');
            })

            it("should return error for invalid budget id in transactions delete route", async () => {
                const res = await request(app)
                    .delete('/transaction/invalidTransactionId')
                    .set('Authorization', `Bearer ${loginRes.body.accessToken.token}`)
                    .send()
                    .expect(400)
                expect(res.body.error).to.equal('Invalid transaction id');
            })

            it("should change the title/amount/category of the transaction", async () => {

                await myFetch(app, 'PUT', `/transaction/${transactionRes.body.transaction._id}`, 200, loginRes.body.accessToken.token, {
                    title: 'newTitle',
                })
                await myFetch(app, 'PUT', `/transaction/${transactionRes.body.transaction._id}`, 200, loginRes.body.accessToken.token, {
                    budget_id: budgetRes.body.budget._id,
                    amount: 20,
                })
                await myFetch(app, 'PUT', `/transaction/${transactionRes.body.transaction._id}`, 200, loginRes.body.accessToken.token, {
                    budget_id: budgetRes.body.budget._id,
                    category: 'newCategory',
                })
                await myFetch(app, 'PUT', `/transaction/${transactionRes.body.transaction._id}`, 200, loginRes.body.accessToken.token, {
                    date: 'newDate',
                })

                const updatedTransaction = await Transaction.findById(transactionRes.body.transaction._id)
                const updatedBudget = await Budget.findById(budgetRes.body.budget._id)

                expect(updatedTransaction.title).to.equal('newTitle')
                expect(updatedTransaction.amount).to.equal(20)
                expect(updatedTransaction.category).to.equal('newCategory')
                expect(updatedTransaction.date).to.equal('newDate')

                expect(updatedBudget.current_balance).to.equal(budgetRes.body.budget.base_balance + 20)
                expect(updatedBudget.categories).includes('newCategory')

            })

            it("should delete the transaction", async () => {
                await request(app)
                .delete(`/transaction/${transactionRes.body.transaction._id}`)
                .set('Authorization', `Bearer ${loginRes.body.accessToken.token}`)
                .send()
                .expect(200)

                expect( await Transaction.findById(transactionRes.body.transaction._id) ).to.be.null

                expect( ( await Budget.findById(budgetRes.body.budget._id) ).transaction_ids )
                .to
                .not
                .includes(transactionRes.body.transaction._id)

                expect( ( await Budget.findById(budgetRes.body.budget._id) ).current_balance )
                .to
                .equal(budgetRes.body.budget.base_balance)
            })

        })

        describe("requires multiple transactions", () => {

            beforeEach(async () => {
                ['testTransaction_1', 'testTransaction_2', 'testTransaction_3'].map(async (title) => {
                    await myFetch ( app, 'POST', '/transaction', 200, loginRes.body.accessToken.token, transactionTest(budgetRes.body.budget._id, title) )
                })
            });

            it("response should include transactions which a budget has", async () => {
                const res = await myFetch ( app, 'GET', `/budget/${budgetRes.body.budget._id}/transactions`, 200, loginRes.body.accessToken.token )    
                expect(res.body.transactions.length).to.equal( (await Budget.findById(budgetRes.body.budget._id)).transaction_ids.length )
            })

        })
    })

    describe("requires multiple budget", () => {

        var budgetRes;

        beforeEach(async () => {
            for ( const name of ['testBudget_1', 'testBudget_2', 'testBudget_3'] ) {
                const res = await myFetch ( app, 'POST', '/budget', 200, loginRes.body.accessToken.token,{ ...budgetTest, name } )
                if (name === 'testBudget_1') {
                    budgetRes = res
                }
            }
        });

        it("response should include all budgets user has", async () => {
            const res = await myFetch ( app, 'GET', `/budget/${budgetRes.body.budget._id}/list`, 200, loginRes.body.accessToken.token ) 
            expect(res.body.currentBudget._id).to.equal(budgetRes.body.budget._id)
            const user_id = ( await User.findOne({ email: 'test@example.com' }) )._id
            expect(res.body.list.length).to.equal( (await Budget.find({ user_id })).length )
        })

    })

})