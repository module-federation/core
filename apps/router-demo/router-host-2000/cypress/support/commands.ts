/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    login(email: string, password: string): void;

    /**
     * Reliably click navigation menu items, even in narrow windows
     * @param menuText Text content of the menu item
     * @example cy.clickMenuItem('remote5')
     */
    clickMenuItem(menuText: string): Chainable<any>;

    /**
     * Wait for content to load and verify text exists
     * @param text Text content to verify
     * @param timeout Timeout in milliseconds
     * @example cy.verifyContent('This is the remote app')
     */
    verifyContent(text: string, timeout?: number): Chainable<any>;

    /**
     * Click an element with a specific class name
     * @param className Class name of the element
     * @example cy.clickByClass('.menu-remote3-home-link')
     */
    clickByClass(className: string): Chainable<any>;

    /**
     * Check loading state and wait for a specified time
     * @param selector Selector for the loading element
     * @param expectedText Expected loading text (optional)
     * @param waitTime Wait time in milliseconds
     * @example cy.checkLoading('[data-test-id="loading"]', 'loading...', 5000)
     */
    checkLoading(
      selector: string,
      expectedText?: string,
      waitTime?: number,
    ): Chainable<any>;
  }
}

// -- This is a parent command --
Cypress.Commands.add('login', (email, password) => {
  // console.log('Custom command example: Login', email, password);
});

/**
 * Reliably click navigation menu items, even in narrow windows
 */
Cypress.Commands.add('clickMenuItem', (menuText) => {
  // Set a larger viewport to ensure menu items are visible
  cy.viewport(1200, 800);

  // Attempt to find and click the menu item in multiple ways
  cy.log(`Attempting to click menu item: "${menuText}"`);

  // First, try to find and click a link containing the specified text
  cy.get('body').then(($body) => {
    // Method 1: Try to click a link containing the specified text
    if ($body.find(`a:contains("${menuText}")`).length > 0) {
      cy.contains('a', menuText).click({ force: true });
    }
    // Method 2: Try to click the menu item text (possibly a dropdown menu title)
    else if (
      $body.find(`.ant-menu-title-content:contains("${menuText}")`).length > 0
    ) {
      cy.contains('.ant-menu-title-content', menuText).click({ force: true });
    }
    // Method 3: Try to click any element containing the text
    else if ($body.find(`:contains("${menuText}")`).length > 0) {
      cy.contains(menuText).click({ force: true });
    }
    // Method 4: If all else fails, try expanding the menu and searching again
    else {
      // Try to click the menu button to expand the menu (if it exists)
      cy.get('.ant-menu-submenu, .menu-fold-icon, .ant-menu-overflow-item')
        .first()
        .click({ force: true })
        .then(() => {
          // Wait for the menu to expand
          cy.wait(500);
          // Try to click the target menu item again
          cy.contains(menuText).click({ force: true });
        });
    }
  });

  // Wait for the route to change
  cy.wait(1000);

  return cy.wrap({});
});

/**
 * Wait for content to load and verify text exists
 */
Cypress.Commands.add('verifyContent', (text, timeout = 10000) => {
  return cy.contains(text, { timeout });
});

/**
 * Click an element with a specific class name
 */
Cypress.Commands.add('clickByClass', (className) => {
  return cy.get(className).click({ force: true });
});

/**
 * Check loading state and wait for a specified time
 */
Cypress.Commands.add(
  'checkLoading',
  (selector, expectedText, waitTime = 5000) => {
    cy.get(selector).should('have.length.at.least', 1);

    if (expectedText) {
      cy.get(selector).first().should('contain', expectedText);
    }

    // Wait for the specified time
    cy.wait(waitTime);

    return cy.wrap({});
  },
);

// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })

// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })

// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
