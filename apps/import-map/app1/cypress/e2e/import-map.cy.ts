describe('import-map runtime host', () => {
  beforeEach(() => cy.visit('/'));

  it('loads the remote module via import map', () => {
    cy.get('[data-test="status"]').contains('Loaded');
    cy.get('[data-test="remote-message"]').contains(
      'Hello from import map remote',
    );
  });
});
