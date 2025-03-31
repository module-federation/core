import { getH2, getH3, wait2s } from '../support/app.po';

describe('router-remote5-2005/', () => {
  beforeEach(() => cy.visit('http://localhost:2005/'));

  describe('visit', () => {
    it('should display React 19 content', () => {
      cy.contains('This is the remote app5 with React 19');
    });
  });
});

// describe('router-remote5-2005 in host', () => {
//   beforeEach(() => cy.visit('/'));

//   describe('Remote5 render and destroy', () => {
//     it('should navigate to remote5 and display React 19 content', () => {
//       // Click on Remote5 link in the menu
//       cy.get('.host-menu > li:nth-child(11)').click();

//       // Verify the content is displayed correctly
//       cy.contains('This is the remote app5 with React 19');

//       // Navigate back to home
//       // cy.get('.host-menu > li:nth-child(1)').click();
//       // cy.contains('Home Page');

//       // // Navigate to remote5 again to verify it can be re-mounted
//       // cy.get('.host-menu > li:nth-child(6)').click();
//       // cy.contains('This is the remote app5 with React 19');
//     });
//   });
// });

describe('router-remote5-2005 in host', () => {
  beforeEach(() => cy.visit('/'));

  describe('Remote5 render and destroy', () => {
    it('jump to remote5 home page', () => {
      cy.get('.host-menu > li:nth-child(11)').click();
      cy.contains('This is the remote app5 with React 19');
      // cy.get('.menu-remote3-home-link').click();

      // getH2().contains('Remote3 home page');
      // cy.get('.menu-remote3-detail-link').click();
      // getH2().contains('Remote3 detail page');
    });
  });
});
