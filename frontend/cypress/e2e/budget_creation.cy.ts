describe('budget_creation', () => {

  beforeEach(() => {

    cy.exec('cd ../api && npm run db:reset && npm run db:seed')
    cy.successfulLogin('test@gmail.com', 'Test21')
    cy.get('[data-cy=createBudgetButton]').click()
    
  })
  
  it('should redirect to budget page after successfull creation', function () {
    cy.successfulBudgetCreation('test', 100)
  })

  it('should close the create budget card on X button click', function () {
    cy.get('[data-cy=close]').click()
    cy.get('[data-cy=addBudget]').should('not.exist')
    cy.get('[data-cy=createBudgetButton]').should('be.visible')
  })
    
})