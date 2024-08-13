describe("Admin functions", () => {
  it("can clear and re-initialise DB", () => {
    cy.visit("/");
    cy.get('[data-test="username-field"]').should("exist").type("admin");
    cy.get('[data-test="start-button"]').should("exist").click();
    cy.get('[data-test="admin-reset-button"]').should("exist").click();
    cy.location("pathname").should("equal", "/app");
    cy.get('[data-test="username-field"]').should("exist").type("admin");
    cy.get('[data-test="start-button"]').should("exist").click();
    cy.location("pathname").should("equal", "/app/admin");
    cy.getByData("plant-db-stats")
      .should("exist")
      .contains("Currently 0 plants");
    cy.getByData("admin-init-button").should("exist").click();
    cy.getByData("plant-db-stats")
      .should("exist")
      .contains("Currently 205 plants");
  });
});

describe.only("Home page", () => {
  beforeEach(() => {
    cy.viewport(550, 750); // Set viewport to 550px x 750px
    cy.viewport("iphone-6"); // Set viewport to 375px x 667px
    cy.visit("/");
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
  it("Can log in as existing user", () => {
    const randomUsername =
      "test_user_AAA_" + Math.floor(Math.random() * 100000).toString();
    cy.get('[data-test="username-field"]').should("exist").type(randomUsername);
    cy.get('[data-test="start-button"]').should("exist").click();
    cy.location("pathname").should("equal", "/app/startwindow");
    cy.get('[data-test="welcome-text"]')
      .should("exist")
      .contains("here is your first plant");
    cy.visit("/app/logout");
    cy.get('[data-test="logout-button"]').should("exist").click();
    // Log in again...
    cy.get('[data-test="username-field"]').should("exist").type(randomUsername);
    cy.get('[data-test="start-button"]').should("exist").click();
    cy.location("pathname").should("equal", "/app/gallery");
    cy.get('[data-test="start-pollinating-button"]')
      .should("exist")
      .contains("Start Pollinating")
      .click();
    cy.getByData("lets-pollinate-header").should("not.exist");
  });
});
