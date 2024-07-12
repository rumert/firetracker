describe('budget_page', () => {

    beforeEach(() => {

      cy.exec('cd ../backend && npm run db:reset && npm run db:seed')
      cy.successfulLogin('test@gmail.com', 'Test21')
      cy.get('[data-cy="addTransactionButton"]').click()
      cy.successfulTransactionCreation('test', 100)

    })
      
    it('should delete the transaction on trash bin button click', function () {
      cy.get('[data-cy=deleteTransaction]').click()
      cy.get('[data-cy=transactionTitle]').should('not.exist')
    })

    it('should move the transaction to the new table after category change', function () {
      cy.get('[data-cy=openDropdown]').click()
      cy.get('[data-cy=categoryList]').click()
      cy.get('[data-cy=categoryToTest]').click()
      cy.get('[data-cy=tableTitle]').should('contain', 'Dining')
    })

  })