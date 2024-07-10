import 'whatwg-fetch';
import { server } from './mock/server';
import { mockScriptDomResponse } from './mock/mock-script';
import helpers from '@module-federation/runtime/helpers';

mockScriptDomResponse({
  baseDir: __dirname,
  baseUrl: 'http://localhost:1111/',
});

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterAll(() => server.close());
afterEach(() => {
  helpers.global.resetFederationGlobalInfo();
  server.resetHandlers();
});
