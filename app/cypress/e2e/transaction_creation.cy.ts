
describe('transaction_creation', () => {

  beforeEach(() => {

    cy.exec('npm run db:reset && npm run db:seed')
    cy.successfulLogin('test@gmail.com', 'Test21')
    cy.get('[data-cy="addTransactionButton"]').click()
  })

  it('should close the add transaction card on X button click', function () {
    cy.get('[data-cy=dialogCloser]').click()
    cy.get('[data-cy=addTransactionCard]').should('not.exist')
  })

  it('should close the form and display the data after successful creation', function () {
    cy.successfulTransactionCreation('test', 10)
  })
  
})