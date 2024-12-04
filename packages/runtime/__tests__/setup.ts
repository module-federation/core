import 'whatwg-fetch';
import { server } from './mock/server';
import { mockScriptDomResponse } from './mock/mock-script';
import { requestList } from './mock/env';
import { resetFederationGlobalInfo } from '@module-federation/runtime-core';

mockScriptDomResponse({
  baseDir: __dirname,
  baseUrl: 'http://localhost:1111/',
});

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterAll(() => server.close());
afterEach(() => {
  resetFederationGlobalInfo();
  requestList.clear();
  server.resetHandlers();
});
