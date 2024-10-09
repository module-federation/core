import { getH1, getH2, getH3, getH4 } from '../support/app.po';

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
    cy.request('/entry-one/nested-routes/pathname');
  });
  it('should ssr success', () => {
    // 若 window._SSR_DATA.renderLevel === 2 ，那么意味着 ssr 成功
    cy.window().should((win) => {
      console.log(win);
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
    getH3().contains('sub self provider');
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

  it('should render sub self provider', () => {
    cy.wait(2000);
    const stub = cy.stub();
    cy.on('window:alert', stub);

    cy.get('#component-provider-components-button')
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
    cy.request('/entry-one/nested-routes/pathname');
  });
  it('should support jump to sub self route', () => {});
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
