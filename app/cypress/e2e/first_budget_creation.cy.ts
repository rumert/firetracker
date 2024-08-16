describe('first_budget_creation', () => {

  beforeEach(() => {
    // reset and seed the database prior to every test
    cy.exec('npm run db:reset')
    cy.successfulSignUp('test2@gmail.com', 'Test21')
  })

  it('should redirect to budget page after successfull creation', function () {
    cy.successfulBudgetCreation('test', 100)
  })
  
})