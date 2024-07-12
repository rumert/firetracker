declare namespace Cypress {
    interface Chainable {
      unsuccessfulLogin(email: string, password: string, expectedError: string): Chainable<Element>;
      successfulLogin(email: string, password: string): Chainable<Element>;
      successfulSignUp(email: string, password: string): Chainable<Element>;
      successfulBudgetCreation(name: string, baseBalance: number): Chainable<Element>;
      successfulTransactionCreation(title: string, amount: number): Chainable<Element>;
    }
}