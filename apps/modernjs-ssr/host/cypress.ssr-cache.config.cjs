module.exports = {
  e2e: {
    specPattern: 'cypress/e2e/*.cy.js',
    supportFile: false,
    fixturesFolder: 'cypress/fixtures',
    injectDocumentDomain: true,
  },
  defaultCommandTimeout: 20_000,
  retries: {
    runMode: 0,
    openMode: 0,
  },
};
