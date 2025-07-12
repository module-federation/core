import { getH1 } from '../support/app.po';

describe('next-app-router-4000', () => {
  beforeEach(() => cy.visit('/'));

  describe('Home page', () => {
    it('should display examples heading', () => {
      getH1().contains('Examples');
    });

    it('should have remote button from module federation', () => {
      cy.get('button').contains('Button from remote').should('exist');
    });

    it('should have navigation links', () => {
      cy.get('a[href="/layouts"]').should('exist');
      cy.get('a[href="/error-handling"]').should('exist');
      cy.get('a[href="/loading"]').should('exist');
    });
  });

  describe('Navigation', () => {
    it('should navigate to layouts page', () => {
      cy.get('a[href="/layouts"]').first().click();
      cy.url().should('include', '/layouts');
    });

    it('should navigate to parallel routes', () => {
      cy.get('a[href="/parallel-routes"]').first().click();
      cy.url().should('include', '/parallel-routes');
    });
  });

  describe('Module Federation', () => {
    it('should load remote button component', () => {
      cy.get('button').contains('Button from remote').should('be.visible');
    });
  });
});
