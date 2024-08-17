
describe('login', () => {

  beforeEach(() => {
    // reset and seed the database prior to every test
    cy.request('GET', `${Cypress.env('MAIN_API_URL')}/test/db/reset`);
    cy.request('GET', `${Cypress.env('MAIN_API_URL')}/test/db/seed`);
  })

  //sign up
  it('should show an error for an invalid email', () => {
    cy.unsuccessfulLogin('invalidemail@', 'ValidPass111', 'Invalid email')
  });

  it('should show an error for a short password', function () {
    cy.unsuccessfulLogin('test@gmail.com', 'test', 'Password must be between 6 and 20 characters')
  })

  it('should show an error for a password with spaces', function () {
    cy.unsuccessfulLogin('validemail@gmail.com', 'invalid password', "Password must not contain spaces")
  })

  it('should show an error for a weak password', function () {
    cy.unsuccessfulLogin('validemail@gmail.com', 'weakpassword', 'Password must contain at least a number and an uppercase letter')
  })

  it('should redirect to homepage with cookies after successfull sign up', function () {
    cy.successfulSignUp('test2@gmail.com', 'ValidPass111')
  })

  //log in
  it('should show an error for wrong password', function () {
    cy.unsuccessfulLogin('test@gmail.com', 'Wrongpassword1', 'Wrong password')
  })

  it('should redirect to budget page with cookies after successfull log in', function () {
    cy.successfulLogin('test@gmail.com', 'Test21')
  })

})