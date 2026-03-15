describe("Authentication", () => {

    it("should register a new user and redirect to dashboard", () => {
        cy.visit("/register");
        const unique = Date.now();

        cy.get("input[name='name']").type("Test User");
        cy.get("input[name='email']").type(`test${unique}@test.com`);
        cy.get("input[name='password']").type("password123");
        cy.contains("button", "Create Account").click();

        cy.url().should("include", "/dashboard");
    });

    it("should login with valid credentials", () => {
        cy.visit("/login");
        cy.get("input[type='email']").type("admin@example.com");
        cy.get("input[type='password']").type("admin123");
        cy.contains("button", "Login").click();

        cy.url().should("include", "/dashboard");
    });

    it("should show error with invalid credentials", () => {
        cy.visit("/login");
        cy.get("input[type='email']").type("wrong@email.com");
        cy.get("input[type='password']").type("wrongpassword");
        cy.contains("button", "Login").click();

        cy.contains("Login failed").should("be.visible");
        cy.url().should("include", "/login");
    });

    it("should not allow access to dashboard when not logged in", () => {
        cy.clearLocalStorage();
        cy.visit("/dashboard");
        cy.url().should("equal", "http://localhost:3000/");
    });

    it("should navigate to forgot password page", () => {
        cy.visit("/login");
        cy.contains("button","Forgot password").click();
        cy.url().should("include", "/forgotPassword");
    });

    it("should show confirmation after submitting forgot password", () => {
        cy.visit("/forgotPassword");
        cy.get("input[type='email']").type("any@email.com");
        cy.contains("button", "Send Reset Link").click();
        cy.contains("Check your email").should("be.visible");
    });
});