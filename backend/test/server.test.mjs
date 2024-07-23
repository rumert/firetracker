
//database
import mongoose from 'mongoose';
import User from '../src/models/user.js';
import Budget from '../src/models/budget.js';
import Transaction from '../src/models/transaction.js'
import connectDB from '../src/config/db.js';

//tools
import request from 'supertest';
import { expect } from 'chai';

//server
import { app } from '../src/servers/server.js';
import { app as authApp } from '../src/servers/authServer.js';

const budgetTest = {
    name: 'testBudget',
    baseBalance: 100,
    isDefault: true
}

function transactionTest (budgetId, title) {
    return {
        budgetId,
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
        await mongoose.connection.db.dropDatabase();
        loginRes = await myFetch(
            authApp, 
            'POST', 
            '/login', 
            200, 
            '', 
            testUser
        )
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

    it("should create a budget and send it to the user", async () => {
        const res = await myFetch(
            app, 
            'POST', 
            '/budget', 
            200, 
            loginRes.body.accessToken.token, 
            budgetTest
        )
        expect(res.body.budget._id).to.equal( (await Budget.findOne({ name: 'testBudget' })).id )
        expect( (await User.findOne({ email: testUser.email })).budget_ids[0] ).to.equal(res.body.budget._id)
    })

    it("should response with 403 if user doesn't have the budget", async () => {
        const res = await myFetch(
            app, 
            'GET', 
            '/budget-list/71F2155B38D1CBDCDA7D54CC', 
            403, 
            loginRes.body.accessToken.token
        )
        expect(res.body).not.have.property('currentBudget')
        expect(res.body).not.have.property('list')
        const user_id = ( await User.findOne({ email: 'test@example.com' }) )._id
        expect( (await Budget.find({ user_id })).length ).to.equal(0)
    })

    describe("requires a budget", () => {

        let budgetRes;

        beforeEach(async () => {
            budgetRes = await myFetch(
                app, 
                'POST', 
                '/budget', 
                200, 
                loginRes.body.accessToken.token,
                budgetTest
            )
        });

        it("response should include default budget id", async () => {
            const res = await myFetch(
                app, 
                'GET', 
                '/default-budget-id', 
                200, 
                loginRes.body.accessToken.token
            )
            expect(res.body.budgetId).to.equal(budgetRes.body.budget._id)
        })

        it("should create transaction", async () => {
            const res = await myFetch (
                app, 
                'POST', 
                '/transaction', 
                200, 
                loginRes.body.accessToken.token,
                transactionTest(budgetRes.body.budget._id, 'testTransaction')
            )
            expect(res.body.transaction._id).to.equal( (await Transaction.findOne({ title: 'testTransaction' })).id )
            const budgetData = (await Budget.findOne({ name: 'testBudget' }))
            expect( budgetData.transaction_ids[0] ).to.equal(res.body.transaction._id)
            expect( budgetData.categories.length ).to.equal(1)
            expect( budgetData.current_balance ).to.equal(110)

        })

        describe("requires a transaction", () => {

            let transactionRes;

            beforeEach(async () => {
                transactionRes = await myFetch (
                    app, 
                    'POST', 
                    '/transaction', 
                    200, 
                    loginRes.body.accessToken.token,
                    transactionTest(budgetRes.body.budget._id, 'testTransaction')
                )
            });

            it("should change the title/amount/category of the transaction", async () => {
                for (const dataToUpdate of [ { title: 'newTitle' }, { amount: 20 }, { category: 'newCategory' } ]) {
                    const res = await myFetch(
                        app, 
                        'PUT', 
                        '/transaction', 
                        200, 
                        loginRes.body.accessToken.token, 
                        { 
                            dataToUpdate, 
                            ...(dataToUpdate?.amount && { amount: transactionRes.body.transaction.amount }),
                            budgetId: budgetRes.body.budget._id, 
                            transactionId: transactionRes.body.transaction._id 
                        }
                    )
                    const updatedTransaction = await Transaction.findById(transactionRes.body.transaction._id)
                    const updatedBudget = await Budget.findById(budgetRes.body.budget._id)

                    if (dataToUpdate?.title) {
                        expect(updatedTransaction.title).to.equal(dataToUpdate.title)
                    } else if (dataToUpdate?.amount) {
                        expect(updatedTransaction.amount).to.equal(dataToUpdate.amount)
                        expect( updatedBudget.current_balance )
                        .to
                        .equal(budgetRes.body.budget.current_balance + dataToUpdate.amount) //new budget balance
                    } else if (dataToUpdate?.category) {
                        expect(updatedTransaction.category).to.equal(dataToUpdate.category)
                        expect( updatedBudget.categories ).includes(dataToUpdate.category)
                    }
                }
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
                    await myFetch (
                        app, 
                        'POST', 
                        '/transaction', 
                        200, 
                        loginRes.body.accessToken.token,
                        transactionTest(budgetRes.body.budget._id, title)
                    )
                })
            });

            it("response should include transactions which a budget has", async () => {
                const res = await myFetch (
                    app, 
                    'GET', 
                    `/transactions/${budgetRes.body.budget._id}`, 
                    200, 
                    loginRes.body.accessToken.token
                )        
                expect(res.body.transactions.length)
                .to
                .equal( (await Budget.findById(budgetRes.body.budget._id)).transaction_ids.length )
            })

        })
    })

    describe("requires multiple budget", () => {

        var budgetRes;

        beforeEach(async () => {
            for ( const name of ['testBudget_1', 'testBudget_2', 'testBudget_3'] ) {
                const res = await myFetch (
                    app, 
                    'POST', 
                    '/budget', 
                    200, 
                    loginRes.body.accessToken.token,
                    { ...budgetTest, name }
                )
                if (name === 'testBudget_1') {
                    budgetRes = res
                }
            }
        });

        it("response should include all budgets user has", async () => {
            const res = await myFetch (
                app, 
                'GET', 
                `/budget-list/${budgetRes.body.budget._id}`, 
                200, 
                loginRes.body.accessToken.token
            ) 
            expect(res.body.currentBudget._id).to.equal(budgetRes.body.budget._id)
            const user_id = ( await User.findOne({ email: 'test@example.com' }) )._id
            expect(res.body.list.length).to.equal( (await Budget.find({ user_id })).length )
        })

    })

})