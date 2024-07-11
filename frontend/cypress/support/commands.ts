
Cypress.Commands.add('unsuccessfulLogin', (email, password, expectedError) => {

  cy.visit('/login');
  cy.get('input[name=email]').type(email)
  cy.get('input[name=password]').type(`${password}{enter}`)
  cy.contains(expectedError).should('be.visible');
  
})

Cypress.Commands.add('successfulLogin', (email, password) => {

  cy.visit('/login');
  cy.get('input[name=email]').type(email)
  cy.get('input[name=password]').type(`${password}{enter}`)
  cy.on('uncaught:exception', (e: any) => {
    if (e.message.includes('NEXT_REDIRECT')) {
      // we expected this redirection, so let's ignore it
      return false
    }
  })
  cy.url({ timeout: 5000 }).should('match', /\/[a-fA-F0-9]{24}$/); // MongoDB ObjectId pattern
  cy.getCookie('refreshToken').should('exist')
  cy.getCookie('accessToken').should('exist')

})

Cypress.Commands.add('successfulSignUp', (email, password) => {

  cy.visit('/login');
  cy.get('input[name=email]').type(email)
  cy.get('input[name=password]').type(`${password}{enter}`)
  cy.wait(5000)
  cy.url().should('eq', 'http://localhost:3000/')
  cy.getCookie('refreshToken').should('exist')
  cy.getCookie('accessToken').should('exist')

})

Cypress.Commands.add('successfulBudgetCreation', (name, balance) => {

  cy.get('input[name=name]').type(name)
  cy.get('input[name=baseBalance]').type(`${balance}{enter}`)
  cy.url({ timeout: 5000 }).should('match', /\/[a-fA-F0-9]{24}$/) // MongoDB ObjectId pattern
    .then(url => {
      cy.get('[data-cy="balance"]').should('contain', balance)
      cy.get('[data-cy="popoverOpener"]').as('btn').click()
      cy.get('@btn').should('contain', name)
      const budgetId: string = url.split('/')[3];
      cy.get(`a[href="/${budgetId}"]`).should('exist')
    })
})