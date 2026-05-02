export {};
Cypress.Commands.add("apiUrl", () => {
    const apiUrl = Cypress.env("apiUrl");
    return cy.wrap(apiUrl);
    //return cy.env(["apiUrl"]).then(e => e.apiUrl);
});

// API login returns auth data
Cypress.Commands.add("apiLogin", (email: string, password: string) => {
  return cy.apiUrl().then((apiUrl) => {
    return cy.request("POST", `${apiUrl}/auth/login`, { email, password }).then(
      (res) =>{
        cy.task("setAuthToken", res.body.token);
        return cy.wrap(res.body);
        }
    );
  });
});

Cypress.Commands.add("apiRegisterAndLogin", () => {
  const unique = Date.now();
  const email = `test${unique}@test.com`;

  return cy.apiUrl().then((apiUrl) => {
    return cy.request("POST", `${apiUrl}/auth/register`, {
      name: "Test User",
      email,
      password: "password123",
    }).then((res) => {
      cy.task("setAuthToken", res.body.token);
      return cy.wrap(res.body);
    });
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      apiUrl(): Chainable<string>;
      apiLogin(email: string, password: string): Chainable<any>;
      apiRegisterAndLogin(): Chainable<any>;
    }
  }
}