describe("Home page", () => {
  beforeEach(() => {
    cy.viewport(550, 750); // Set viewport to 550px x 750px
    cy.viewport("iphone-6"); // Set viewport to 375px x 667px
    cy.visit("http://localhost:8888/");
  });
  it("Can log in as admin", () => {
    cy.location("pathname").should("equal", "/app");
    cy.get('[data-test="username-field"]').should("exist").type("admin");
    cy.get('[data-test="start-button"]').should("exist").click();
    cy.location("pathname").should("equal", "/app/admin");
    cy.getByData("lets-pollinate-header").should("not.exist");
  });
  it("Can log in creating new user", () => {
    const randomUsername =
      "test_user_" + Math.floor(Math.random() * 100000).toString();
    cy.get('[data-test="username-field"]').should("exist").type(randomUsername);
    cy.get('[data-test="start-button"]').should("exist").click();
    cy.location("pathname").should("equal", "/app/startwindow");
    cy.getByData("lets-pollinate-header").should("exist");
    cy.get('[data-test="welcome-text"]')
      .should("exist")
      .contains("here is your first plant");
    cy.get('[data-test="bottom-action-button"]')
      .should("exist")
      .find("button")
      .contains("Great!")
      .click();
    cy.get('[data-test="bottom-action-button"]')
      .should("exist")
      .find("button")
      .contains("Start Pollinating");
  });
});
