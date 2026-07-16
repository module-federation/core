type RuntimeInstance = {
  options: {
    remotes: Array<{ name: string; entry?: string }>;
  };
  registerRemotes: (remotes: Array<{ name: string; entry: string }>) => void;
  loadRemote: (id: string) => Promise<unknown>;
};

const getRuntimeInstance = (win: Cypress.AUTWindow): RuntimeInstance => {
  const instance = (win as any).__FEDERATION__?.__INSTANCES__?.find(
    (candidate: { name?: string }) => candidate.name === 'runtime_host',
  );

  expect(instance, 'runtime_host federation instance').to.exist;
  return instance;
};

const getRemoteEntry = (instance: RuntimeInstance, name: string) =>
  instance.options.remotes.find((remote) => remote.name === name)?.entry;

const withRemoteName = (
  manifest: Record<string, any>,
  name: string,
): Record<string, any> => ({
  ...manifest,
  id: name,
  name,
  metaData: {
    ...manifest.metaData,
    name,
  },
});

describe('relative remote entry resolution', () => {
  it('resolves every URL reference form from a nested route and loads the manifest', () => {
    cy.request('http://127.0.0.1:3006/mf-manifest.json').then(
      ({ body: manifest }) => {
        cy.intercept(
          'GET',
          'http://127.0.0.1:3005/catalog/item/mf-manifest.json',
          withRemoteName(manifest, 'browser_current_remote'),
        ).as('currentManifest');

        cy.visit('/');
        cy.window().then((win) => {
          win.history.replaceState(
            {},
            '',
            '/catalog/item/1?tab=details#summary',
          );

          const instance = getRuntimeInstance(win);
          instance.registerRemotes([
            { name: 'browser_current_remote', entry: './mf-manifest.json' },
            { name: 'browser_parent_remote', entry: '../mf-manifest.json' },
            { name: 'browser_root_remote', entry: '/mf-manifest.json' },
            { name: 'browser_bare_remote', entry: 'mf-manifest.json' },
            {
              name: 'browser_protocol_relative_remote',
              entry: '//cdn.example/remoteEntry.js',
            },
            {
              name: 'browser_absolute_remote',
              entry: 'https://cdn.example/remoteEntry.js?version=1#entry',
            },
            { name: 'browser_query_remote', entry: '?manifest=1' },
            { name: 'browser_hash_remote', entry: '#manifest' },
          ]);

          expect(getRemoteEntry(instance, 'browser_current_remote')).to.equal(
            'http://127.0.0.1:3005/catalog/item/mf-manifest.json',
          );
          expect(getRemoteEntry(instance, 'browser_parent_remote')).to.equal(
            'http://127.0.0.1:3005/catalog/mf-manifest.json',
          );
          expect(getRemoteEntry(instance, 'browser_root_remote')).to.equal(
            'http://127.0.0.1:3005/mf-manifest.json',
          );
          expect(getRemoteEntry(instance, 'browser_bare_remote')).to.equal(
            'http://127.0.0.1:3005/mf-manifest.json',
          );
          expect(
            getRemoteEntry(instance, 'browser_protocol_relative_remote'),
          ).to.equal('http://cdn.example/remoteEntry.js');
          expect(getRemoteEntry(instance, 'browser_absolute_remote')).to.equal(
            'https://cdn.example/remoteEntry.js?version=1#entry',
          );
          expect(getRemoteEntry(instance, 'browser_query_remote')).to.equal(
            'http://127.0.0.1:3005/?manifest=1',
          );
          expect(getRemoteEntry(instance, 'browser_hash_remote')).to.equal(
            'http://127.0.0.1:3005/#manifest',
          );

          return instance.loadRemote(
            'browser_current_remote/useCustomRemoteHook',
          );
        });

        cy.wait('@currentManifest')
          .its('response.statusCode')
          .should('eq', 200);
      },
    );
  });

  it('honors trailing slashes and the document base URL', () => {
    cy.request('http://127.0.0.1:3006/mf-manifest.json').then(
      ({ body: manifest }) => {
        cy.intercept(
          'GET',
          'http://127.0.0.1:3005/nested/application/mf-manifest.json',
          withRemoteName(manifest, 'browser_base_current_remote'),
        ).as('baseManifest');

        cy.visit('/');
        cy.window().then((win) => {
          win.history.replaceState({}, '', '/catalog/item/');

          const instance = getRuntimeInstance(win);
          instance.registerRemotes([
            {
              name: 'browser_trailing_current_remote',
              entry: './mf-manifest.json',
            },
            {
              name: 'browser_trailing_parent_remote',
              entry: '../mf-manifest.json',
            },
          ]);

          expect(
            getRemoteEntry(instance, 'browser_trailing_current_remote'),
          ).to.equal('http://127.0.0.1:3005/catalog/item/mf-manifest.json');
          expect(
            getRemoteEntry(instance, 'browser_trailing_parent_remote'),
          ).to.equal('http://127.0.0.1:3005/catalog/mf-manifest.json');

          const base = win.document.createElement('base');
          base.href = '/nested/application/';
          win.document.head.appendChild(base);

          instance.registerRemotes([
            {
              name: 'browser_base_current_remote',
              entry: './mf-manifest.json',
            },
            {
              name: 'browser_base_parent_remote',
              entry: '../mf-manifest.json',
            },
          ]);

          expect(
            getRemoteEntry(instance, 'browser_base_current_remote'),
          ).to.equal(
            'http://127.0.0.1:3005/nested/application/mf-manifest.json',
          );
          expect(
            getRemoteEntry(instance, 'browser_base_parent_remote'),
          ).to.equal('http://127.0.0.1:3005/nested/mf-manifest.json');

          return instance.loadRemote(
            'browser_base_current_remote/useCustomRemoteHook',
          );
        });

        cy.wait('@baseManifest').its('response.statusCode').should('eq', 200);
      },
    );
  });
});
