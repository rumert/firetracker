const request = require('supertest');
const http = require('http');
const app = require('../../src/server');
const Transaction = require('../../src/models/transaction');
const Budget = require('../../src/models/budget');
const { fetchCategoryFromAI } = require('../../src/utils/functions');

jest.mock('../../src/models/transaction');
jest.mock('../../src/models/budget');
jest.mock('../../src/utils/functions', () => ({
  fetchCategoryFromAI: jest.requireActual('../../src/utils/functions').fetchCategoryFromAI,
  getDataWithCaching: jest.fn(async (_, __, cb) => await cb()),
  throwError: jest.requireActual('../../src/utils/functions').throwError,
}));
jest.mock('../../src/config/redis', () => ({
  get: jest.fn(),
  set: jest.fn(),
  setEx: jest.fn(),
  multi: jest.fn(() => ({
    del: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  })),
}));

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn((token, secret, callback) => {
    callback(null, { uid: 'testUser', email: 'test@example.com' });
  }),
}));

const server = http.createServer(app);

describe('Transaction Routes', () => {
  const validTransactionId = '60d21b4667d0d8992e610c85';
  const validBudgetId = '60d21b4667d0d8992e610c86';

  afterAll(() => {
    server.close();
  });

  describe('GET /transaction/:id', () => {
    it('should return a transaction by ID', async () => {
      const mockTransaction = { _id: validTransactionId, user_id: 'testUser', amount: 100 };
      Transaction.findOne.mockResolvedValue(mockTransaction);

      const response = await request(server)
        .get(`/transaction/${validTransactionId}`)
        .set('Authorization', 'Bearer testToken');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTransaction);
    });

    it('should return 404 if transaction is not found', async () => {
      Transaction.findOne.mockResolvedValue(null);

      const response = await request(server)
        .get(`/transaction/${validTransactionId}`)
        .set('Authorization', 'Bearer testToken');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /transactions/:budget_id', () => {
    it('should return transactions for a budget', async () => {
      const mockTransactions = [{ _id: validTransactionId, amount: 100 }];
      Transaction.find.mockResolvedValue(mockTransactions);

      const response = await request(server)
        .get(`/transactions/${validBudgetId}`)
        .set('Authorization', 'Bearer testToken');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTransactions);
    });

    it('should return 404 if no transactions are found', async () => {
      Transaction.find.mockResolvedValue(null);

      const response = await request(server)
        .get(`/transactions/${validBudgetId}`)
        .set('Authorization', 'Bearer testToken');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /transaction/:budget_id', () => {
    it('should create a new transaction and update the budget', async () => {
      const mockTransaction = { _id: '789', amount: 200, category: 'Expense' };
      const mockBudget = { _id: validBudgetId };

      Transaction.create.mockResolvedValue(mockTransaction);
      Budget.findByIdAndUpdate.mockResolvedValue(mockBudget);
      fetchCategoryFromAI.mockResolvedValue('Expense');

      const response = await request(server)
        .post(`/transaction/${validBudgetId}`)
        .set('Authorization', 'Bearer testToken')
        .send({
          type: 'expense',
          amount: 200,
          date: '2025-01-01',
          title: 'Test Transaction',
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTransaction);
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(server)
        .post(`/transaction/${validBudgetId}`)
        .set('Authorization', 'Bearer testToken')
        .send({
          amount: 200,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /transaction/:id', () => {
    it('should update a transaction and adjust the budget', async () => {
      const mockOldTransaction = { _id: validTransactionId, amount: 100, budget_id: validBudgetId };
      const mockNewTransaction = { _id: validTransactionId, amount: 200 };

      Transaction.findOne.mockResolvedValue(mockOldTransaction);
      Transaction.findByIdAndUpdate.mockResolvedValue(mockNewTransaction);

      const response = await request(server)
        .put(`/transaction/${validTransactionId}`)
        .set('Authorization', 'Bearer testToken')
        .send({ amount: 200 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockNewTransaction);
    });

    it('should return 404 if transaction to update is not found', async () => {
      Transaction.findOne.mockResolvedValue(null);

      const response = await request(server)
        .put(`/transaction/${validTransactionId}`)
        .set('Authorization', 'Bearer testToken')
        .send({ amount: 200 });

      expect(response.status).toBe(404);
    });

    it('should return 400 if no field is provided to update', async () => {
      const response = await request(server)
        .put(`/transaction/${validTransactionId}`)
        .set('Authorization', 'Bearer testToken')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /transaction/:id', () => {
    it('should delete a transaction and update the budget', async () => {
      const mockTransaction = { _id: validTransactionId, budget_id: validBudgetId, amount: 100 };

      Transaction.findOneAndDelete.mockResolvedValue(mockTransaction);

      const response = await request(server)
        .delete(`/transaction/${validTransactionId}`)
        .set('Authorization', 'Bearer testToken');

      expect(response.status).toBe(200);
      expect(response.body).toBe('OK');
    });

    it('should return 404 if transaction to delete is not found', async () => {
      Transaction.findOneAndDelete.mockResolvedValue(null);

      const response = await request(server)
        .delete(`/transaction/${validTransactionId}`)
        .set('Authorization', 'Bearer testToken');

      expect(response.status).toBe(404);
    });
  });
});
