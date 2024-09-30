import { getH1, getH3 } from '../support/app.po';

describe('/', () => {
  beforeEach(() => cy.visit('/'));

  describe('Warmup ModernJS', () => {
    it('warms pages concurrently', () => {
      const urls = [
        '/all',
        '/remote',
        '/nested-remote',
        '/dynamic-remote',
        '/dynamic-nested-remote',
      ];
      urls.forEach((url) => {
        cy.request(url); // This makes a GET request, not a full page visit
      });
    });
  });

  describe('Welcome message', () => {
    it('should display welcome message', () => {
      getH1().contains('This is SPA combined');
    });
  });

  describe('Routing checks', () => {
    it('check that clicking back and forwards in client side routeing still renders the content correctly', () => {
      cy.visit('/remote');
      cy.wait(3000);
      cy.url().should('include', '/remote');
      getH1().contains('Static Remote');
      cy.get('.home').click({ force: true });
      cy.wait(2000);
      cy.location('pathname').should('eq', '/');
      cy.wait(700);
      getH1().contains('This is SPA combined');
    });
  });

  describe('/nested-remote', () => {
    beforeEach(() => cy.visit('/nested-remote'));

    it('should display welcome message', () => {
      getH1().contains('Static Nested Remote');
    });

    it('the button should be interactive', () => {
      cy.wait(2000);
      const stub = cy.stub();
      cy.on('window:alert', stub);

      cy.get('#nested-remote-local-button')
        .should('be.visible')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith(
            '[Nested Remote Page] Client side Javascript works!',
          );
        });
    });

    it('should load nested remote components', () => {
      cy.get('#nested-remote-components').contains('nested remote');

      // test remote
      cy.get('#remote-components').contains('remote');
      cy.get('#remote-components-image').should(
        'have.attr',
        'src',
        'https://module-federation.io/module-federation-logo.svg',
      );
    });

    // it('should inject link tag if use collectSSRAssets', () => {
    //   cy.get('#nested-remote-components')
    //     .find('link')
    //     .should('have.attr', 'href')
    //     .then((hrefs) => {
    //       const hrefArrs = Array.isArray(hrefs) ? hrefs : [hrefs];
    //       const targetHref = hrefArrs.find((href) =>
    //         href.includes('__federation_expose_Image.css'),
    //       );
    //       expect(targetHref).to.exist;
    //     });
    // });

    it('nested remote component should be interactive', () => {
      cy.wait(2000);
      const stub = cy.stub();
      cy.on('window:alert', stub);

      cy.get('#nested-remote-components-button')
        .should('be.visible')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith(
            '[nested-remote-components] Client side Javascript works!',
          );
        });

      cy.get('#remote-components-button')
        .should('be.visible')
        .click()
        .then(() => {
          expect(stub.getCall(1)).to.be.calledWith(
            '[remote-components] Client side Javascript works!',
          );
        });
    });
  });

  describe('/dynamic-nested-remote', () => {
    beforeEach(() => cy.visit('/dynamic-nested-remote'));

    describe('Welcome message', () => {
      it('should display welcome message', () => {
        getH1().contains('Dynamic Nested Remote');
      });
    });

    it('the button should be interactive', () => {
      cy.wait(2000);
      cy.get('button').contains('Button');

      const stub = cy.stub();
      cy.on('window:alert', stub);

      cy.get('#nested-dynamic-remote-local-button')
        .should('be.visible')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith(
            '[Nested Dynamic Remote Page] Client side Javascript works!',
          );
        });
    });

    it('should load nested dynamic remote components', () => {
      cy.get('#nested-dynamic-remote-components').contains(
        'dynamic nested remote',
      );

      // test dynamic remote
      cy.get('#dynamic-remote-components').contains('dynamic remote');
      cy.get('#dynamic-remote-components-image').should(
        'have.attr',
        'src',
        'https://module-federation.io/module-federation-logo.svg',
      );
    });

    it('should inject link tag if use MFReactComponent', () => {
      cy.get('#nested-dynamic-remote-components')
        .find('link')
        .should('have.attr', 'href')
        .then((hrefs) => {
          const hrefArrs = Array.isArray(hrefs) ? hrefs : [hrefs];
          const targetHref = hrefArrs.find((href) =>
            href.includes('__federation_expose_Image.css'),
          );
          expect(targetHref).to.exist;
        });
    });

    it('nested dynamic remote component should be interactive', () => {
      cy.wait(2000);

      const stub = cy.stub();
      cy.on('window:alert', stub);

      cy.get('#nested-dynamic-remote-components-button')
        .should('be.visible')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith(
            '[nested-dynamic-remote-components] Client side Javascript works!',
          );
        });

      cy.get('#dynamic-remote-components-button')
        .should('be.visible')
        .click()
        .then(() => {
          expect(stub.getCall(1)).to.be.calledWith(
            '[dynamic-remote-components] Client side Javascript works!',
          );
        });
    });
  });

  describe('/remote', () => {
    beforeEach(() => {
      cy.visit('/remote');
      cy.visit('/');
      cy.visit('/remote');
    });

    it('should display welcome message', () => {
      getH1().contains('Static Remote');
    });

    it('the button should be interactive', () => {
      cy.wait(2000);

      cy.get('button').contains('Button');

      const stub = cy.stub();
      cy.on('window:alert', stub);

      cy.get('#remote-local-button')
        .should('be.visible')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith(
            '[Remote Page] Client side Javascript works!',
          );
        });
    });

    it('should load remote components', () => {
      cy.get('#remote-components').contains('remote');
      cy.get('#remote-components-image').should(
        'have.attr',
        'src',
        'https://module-federation.io/module-federation-logo.svg',
      );
    });

    it('remote component should be interactive', () => {
      cy.wait(2000);

      const stub = cy.stub();
      cy.on('window:alert', stub);

      cy.get('#remote-components-button')
        .should('be.visible')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith(
            '[remote-components] Client side Javascript works!',
          );
        });
    });
  });

  describe('/dynamic-remote', () => {
    beforeEach(() => {
      cy.visit('/dynamic-remote');
      cy.visit('/');
      cy.visit('/dynamic-remote');
    });

    it('should display welcome message', () => {
      getH1().contains('Dynamic Remote');
    });

    it('the button should be interactive', () => {
      cy.wait(2000);

      cy.get('button').contains('Button');

      const stub = cy.stub();
      cy.on('window:alert', stub);

      cy.get('#dynamic-remote-local-button')
        .should('be.visible')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith(
            '[Dynamic Remote Page] Client side Javascript works!',
          );
        });
    });

    it('should load dynamic remote components', () => {
      cy.get('#dynamic-remote-components').contains('dynamic remote');
      cy.get('#dynamic-remote-components-image').should(
        'have.attr',
        'src',
        'https://module-federation.io/module-federation-logo.svg',
      );
    });

    it('dynamic remote component should be interactive', () => {
      cy.wait(2000);

      const stub = cy.stub();
      cy.on('window:alert', stub);

      cy.get('#dynamic-remote-components-button')
        .should('be.visible')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith(
            '[dynamic-remote-components] Client side Javascript works!',
          );
        });
    });
  });
});
