import { getH1, getH2, getH3, getH4, getH5 } from '../support/app.po';

const hostUrlPrefix = 'http://localhost:3062';

describe('Warmup ModernJS', () => {
  it('warms pages concurrently', () => {
    const urls = ['/entry-one/nested-routes/pathname', '/entry-two'];
    urls.forEach((url) => {
      cy.visit(`${hostUrlPrefix}${url}`);
    });
  });
});

describe('Check SSR', () => {
  beforeEach(() => {
    cy.visit(hostUrlPrefix + '/entry-one/nested-routes/pathname');
  });
  it('should ssr success', () => {
    cy.window().should((win) => {
      // @ts-ignore
      expect(win._SSR_DATA.renderLevel).to.equal(2);
    });
  });

  it('should render host layout', () => {
    getH1().contains('entry one layout');
  });

  it('should render host path layout', () => {
    getH2().contains('nested-routes layout');
  });

  it('should render sub layout', () => {
    getH3().contains('sub layout');
  });

  it('should render sub page', () => {
    getH4().contains('sub self provider');
  });

  it('should get sub data loader data successfully', () => {
    cy.get('#sub-data')
      .invoke('html')
      .then((innerHTML) => {
        expect(innerHTML).to.equal('hello world!');
      });
  });

  it('should render sub self component and the the component should be interactive', () => {
    cy.wait(2000);
    const stub = cy.stub();
    cy.on('window:alert', stub);

    cy.get('#sub-component-button')
      .should('be.visible')
      .click()
      .then(() => {
        expect(stub.getCall(0)).to.be.calledWith(
          '[sub] Client side Javascript works!',
        );
      });
  });

  it('should render sub self provider and the the sub provider button should be interactive', () => {
    cy.wait(3000);
    const stub = cy.stub();
    cy.on('window:alert', stub);

    cy.get('#sub-provider-components-button')
      .should('be.visible')
      .click()
      .then(() => {
        expect(stub.getCall(0)).to.be.calledWith(
          '[sub-provider-components] Client side Javascript works!',
        );
      });
  });
});

describe('check SSR route', () => {
  beforeEach(() => {
    cy.visit(hostUrlPrefix + '/entry-one/nested-routes/pathname');
  });
  it('should support jump to sub self route', () => {
    cy.get('#sub-link').click();
    cy.url().should('include', '/entry-one/nested-routes/pathname/a');
    getH5().contains('page/a');
  });
});

describe('check CSR', () => {
  beforeEach(() => {
    cy.visit(hostUrlPrefix + '/entry-two');
  });
  it('should render csr page', () => {
    cy.window().should((win) => {
      console.log(111, win._SSR_DATA);
      // @ts-ignore
      expect(win._SSR_DATA).to.equal(undefined);
    });
    getH2().contains('entry two page');
  });
});

describe('check CSR route', () => {
  beforeEach(() => {
    cy.visit(hostUrlPrefix + '/entry-two/federation');
  });
  it('should render sub self component and the the component should be interactive', () => {
    cy.wait(2000);
    cy.window().should((win) => {
      // @ts-ignore
      expect(win._SSR_DATA).to.equal(undefined);
    });
    const stub = cy.stub();
    cy.on('window:alert', stub);

    cy.get('#sub-component-button')
      .should('be.visible')
      .click()
      .then(() => {
        expect(stub.getCall(0)).to.be.calledWith(
          '[sub] Client side Javascript works!',
        );
      });
  });

  it('should support jump to sub self route', () => {
    cy.get('#sub-link').click();
    cy.url().should('include', '/entry-two/federation/a');
    getH5().contains('page/a');
  });
});
