describe('budget_page', () => {

    beforeEach(() => {

      cy.request('GET', `${Cypress.env('MAIN_API_URL')}/test/db/reset`);
      cy.request('GET', `${Cypress.env('MAIN_API_URL')}/test/db/seed`);
      cy.successfulLogin('test@gmail.com', 'Test21')
      cy.get('[data-cy="addTransactionButton"]').click()
      cy.successfulTransactionCreation('test', 100)

    })
      
    it('should delete the transaction on trash bin button click', function () {
      cy.get('[data-cy=deleteTransaction]').click()
      cy.get('[data-cy=transactionTitle]').should('not.exist')
    })

    it('should change the title of the transaction', function () {
      cy.get('[data-cy=titleButtonCy]').click()
      cy.get('[data-cy=titleInputCy]').type('updated title{enter}')
      cy.get('[data-cy=titleButtonCy]').should('contain', 'updated title')
    })

    it('should change transaction amount and budget balance', function () {
      cy.get('[data-cy=amountButtonCy]').click()
      cy.get('[data-cy=amountInputCy]').type('50{enter}')
      cy.get('[data-cy=amountButtonCy]').should('contain', 50)
      cy.get('[data-cy=balance]').should('contain', 50)
    })

    it('should move the transaction to the new table after category change', function () {
      cy.get('[data-cy=openDropdown]').click()
      cy.get('[data-cy=categoryList]').click()
      cy.get('[data-cy=categoryToTest]').click()
      cy.get('[data-cy=tableTitle]').should('contain', 'Dining')
    })

  })