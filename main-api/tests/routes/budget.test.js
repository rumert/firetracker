const request = require('supertest');
const http = require('http');
const app = require('../../src/server');
const Budget = require('../../src/models/budget');
const User = require('../../src/models/user');
const Transaction = require('../../src/models/transaction');

jest.mock('../../src/models/budget');
jest.mock('../../src/models/user');
jest.mock('../../src/models/transaction');
jest.mock('../../src/utils/functions', () => ({
  getDataWithCaching: jest.fn(async (_, __, cb) => await cb()),
  throwError: jest.requireActual('../../src/utils/functions').throwError,
}));
jest.mock('../../src/config/redis', () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
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

describe('Budget Routes', () => {
  const validTransactionId = '60d21b4667d0d8992e610c85';
  const validBudgetId = '60d21b4667d0d8992e610c86';
  const validUserId = 'testUser';

  afterAll(() => {
    server.close();
  });

  describe('GET /budget/default', () => {
    it('should return the default budget for the user', async () => {
      const mockBudget = { _id: validBudgetId, is_default: true, user_id: validUserId };
      Budget.findOne.mockResolvedValue(mockBudget);

      const response = await request(server)
        .get('/budget/default')
        .set('Authorization', 'Bearer testToken');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBudget);
    });

    it('should return null if no default budget is found', async () => {
      Budget.findOne.mockResolvedValue(null);

      const response = await request(server)
        .get('/budget/default')
        .set('Authorization', 'Bearer testToken');

      expect(response.status).toBe(200);
      expect(response.body).toBeNull();
    });
  });

  describe('GET /budget/:id', () => {
    it('should return a budget by ID', async () => {
      const mockBudget = { _id: validBudgetId, user_id: validUserId };
      Budget.findOne.mockResolvedValue(mockBudget);

      const response = await request(server)
        .get(`/budget/${validBudgetId}`)
        .set('Authorization', 'Bearer testToken');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBudget);
    });

    it('should return 404 if budget is not found', async () => {
      Budget.findOne.mockResolvedValue(null);

      const response = await request(server)
        .get(`/budget/${validBudgetId}`)
        .set('Authorization', 'Bearer testToken');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /budget/all', () => {
    it('should return all budgets for the user', async () => {
      const mockBudgets = [{ _id: validBudgetId, user_id: validUserId }];
      Budget.find.mockResolvedValue(mockBudgets);

      const response = await request(server)
        .get('/budget/all')
        .set('Authorization', 'Bearer testToken');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBudgets);
    });

    it('should return an empty array if no budgets are found', async () => {
      Budget.find.mockResolvedValue([]);

      const response = await request(server)
        .get('/budget/all')
        .set('Authorization', 'Bearer testToken');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('POST /budget', () => {
    it('should create a new budget and update the user', async () => {
      const mockBudget = { _id: validBudgetId, name: 'Test Budget', user_id: validUserId };
      Budget.create.mockResolvedValue(mockBudget);
      User.findByIdAndUpdate.mockResolvedValue({});

      const response = await request(server)
        .post('/budget')
        .set('Authorization', 'Bearer testToken')
        .send({
          name: 'Test Budget',
          base_balance: 1000,
          is_default: true,
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBudget);
    });
  });

  describe('PUT /budget/:id', () => {
    it('should update a budget by ID', async () => {
      const mockOldBudget = { _id: validBudgetId, user_id: validUserId, current_balance: 1000 };
      const mockNewBudget = { ...mockOldBudget, name: 'Updated Budget' };

      Budget.findOne.mockResolvedValue(mockOldBudget);
      Budget.findByIdAndUpdate.mockResolvedValue(mockNewBudget);

      const response = await request(server)
        .put(`/budget/${validBudgetId}`)
        .set('Authorization', 'Bearer testToken')
        .send({
          edits: { name: 'Updated Budget' },
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockNewBudget);
    });
  });

  describe('DELETE /budget/:id', () => {
    it('should delete a budget and its transactions', async () => {
      const mockBudget = { _id: validBudgetId, is_default: true, transaction_ids: [validTransactionId] };
      Budget.findOneAndDelete.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockBudget)
      });
      Budget.findOneAndUpdate.mockResolvedValue({})
      Transaction.deleteMany.mockResolvedValue({});

      const response = await request(server)
        .delete(`/budget/${validBudgetId}`)
        .set('Authorization', 'Bearer testToken');

      expect(response.status).toBe(200);
      expect(response.body).toBe('OK');
    });
  });
});
