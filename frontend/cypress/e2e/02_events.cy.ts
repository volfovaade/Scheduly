describe("Event Management", () => {
  beforeEach(() => {
    cy.session("auth-session", () => {
      cy.apiRegisterAndLogin().then((auth) => {
        const safeUserId = auth.userId || auth.id || (auth.user && auth.user.id);
        const safeName = auth.name || (auth.user && auth.user.name) || "Test User";

        // We can safely visit the dashboard directly now
        cy.visit("/dashboard", {
          onBeforeLoad(win) {
            win.sessionStorage.setItem("token", auth.token);
            win.sessionStorage.setItem("userId",auth.userId );
            win.sessionStorage.setItem("name", auth.name);
          },
        });
        cy.url().should("include", "/dashboard");
      });
    });
  });

  it("should create a single day fully open event", () => {
    // localStorage je již obnovena z beforeEach
    cy.visit("/dashboard");
    
    cy.contains("+ Add Event").click();
    cy.contains("Single").click();
    cy.contains("Fully open").click();

    cy.get('input[placeholder*="For example"]').type("Cypress Test Event");
    cy.get('textarea[placeholder*="Optional event description"]').type("Created by Cypress");

    const from = new Date(Date.now() + 86400000).toISOString().slice(0, 16);
    const to = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16);

    cy.get("input[type='datetime-local']").first().type(from);
    cy.get("input[type='datetime-local']").last().type(to);

    cy.contains("button", "Create event").click();

    cy.contains("Cypress Test Event").should("be.visible");
  });

  it("should display event detail after clicking on event", () => {
    cy.task("getAuthToken").then((token) => {
      cy.apiUrl().then((apiUrl) => {
        // Return the request so Cypress waits for it to finish
        return cy.request({
          method: "POST",
          url: `${apiUrl}/events`,
          headers: { Authorization: `Bearer ${token}` },
          body: {
            title: "Detail Test Event",
            mode: "FullyOpen",
            timeRangeFrom: new Date(Date.now() + 86400000).toISOString(),
            timeRangeTo: new Date(Date.now() + 7 * 86400000).toISOString(),
          },
        });
      }).then(() => {
        cy.visit("/dashboard");
        cy.contains("Detail Test Event").click();
        cy.contains(':visible', "Add Time Preferences").should("be.visible");
      });
    });
  });

  it("should delete an event", () => {
    cy.task("getAuthToken").then((token) => {
      cy.apiUrl().then((apiUrl) => {
        return cy.request({
          method: "POST",
          url: `${apiUrl}/events`,
          headers: { Authorization: `Bearer ${token}` },
          body: {
            title: "Event For Delete",
            mode: "FullyOpen",
            timeRangeFrom: new Date(Date.now() + 86400000).toISOString(),
            timeRangeTo: new Date(Date.now() + 7 * 86400000).toISOString(),
          },
        });
      }).then(() => {
        cy.visit("/dashboard");
        cy.contains(".relative", "Event For Delete")
          .find("button") 
          .click({ multiple: true });
        cy.contains("Event For Delete").should("not.exist");
      });
    });
  });

  it("should not join an event using a code", () => {
    cy.task("getAuthToken").then((token) => {
      // Returnujeme cy.request, abychom mohli řetězit .then() s odpovědí
      return cy.apiUrl().then((apiUrl) => {
        return cy.request({
          method: "POST",
          url: `${apiUrl}/events`,
          headers: { Authorization: `Bearer ${token}` },
          body: {
            title: "Join Code Event",
            mode: "FullyOpen",
            timeRangeFrom: new Date(Date.now() + 86400000).toISOString(),
            timeRangeTo: new Date(Date.now() + 7 * 86400000).toISOString(),
          },
        });
      });
    }).then((res: any) => {
      const code = res.body.code;

      cy.visit("/");
      cy.get("input[placeholder*='ode']").type(code);
      cy.contains("button", "Join the event").click();

      cy.contains("You are already the owner").should("be.visible");
    });
  });
});