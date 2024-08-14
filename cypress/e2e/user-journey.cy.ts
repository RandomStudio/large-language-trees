describe("User can pollinate a new plant", () => {
  beforeEach(() => {
    cy.viewport(550, 750); // Set viewport to 550px x 750px
    cy.viewport("iphone-6"); // Set viewport to 375px x 667px
    cy.visit("/");
  });

  it("Can log in and start pollinating with first plant", () => {
    const user1 =
      "test_user_A_" + Math.floor(Math.random() * 100000).toString();
    // Log in and get started
    cy.get('[data-test="username-field"]').should("exist").type(user1);
    cy.get('[data-test="start-button"]').should("exist").click();
    cy.location("pathname").should("equal", "/app/startwindow");

    // Click then click again
    cy.get('[data-test="bottom-action-button"]')
      .should("exist")
      .contains("Great!")
      .click();

    cy.get('[data-test="bottom-action-button"]')
      .should("exist")
      .contains("Start Pollinating")
      .click();

    cy.location("pathname").should("include", "app/gallery/pollination");

    let user1PlantId = "";
    cy.location("pathname").then((p) => {
      const parts = p.split("/");
      expect(parts.length).eq(5);
      user1PlantId = parts[parts.length - 1];
      expect(user1PlantId.length).greaterThan(0);
      cy.visit(`/app/gallery/pollination/${user1PlantId}/`);
      cy.location("pathname").should("include", user1PlantId);

      // cy.wrap(user1PlantId);

      cy.visit("/app/logout");
      cy.getByData("logout-button").click();

      // Log in second user
      const user2_username =
        "test_user_B_" + Math.floor(Math.random() * 100000).toString();

      cy.getByData("username-field").type(user2_username);
      cy.getByData("start-button").click();

      // Click through twice
      cy.getByData("bottom-action-button").click();
      cy.getByData("bottom-action-button").click();

      cy.location("pathname")
        .should("include", "app/gallery/pollination")
        .then((p) => {
          cy.visit(`${p}?authorBottom=${user1}&parent2=${user1PlantId}`);

          // cy.getByData("bottom-action-button").should("exist").click();
        });
    });
  });
});

// http://localhost:8888/app/gallery/pollination/peony?authorBottom=test_user_A_23043&parent2=strawberry
