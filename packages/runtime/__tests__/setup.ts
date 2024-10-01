import 'whatwg-fetch';
import { server } from './mock/server';
import { mockScriptDomResponse } from './mock/mock-script';
import { requestList } from './mock/env';
import { resetFederationGlobalInfo } from '../src/global';
// Setup mock script response
mockScriptDomResponse({
  baseDir: __dirname,
  baseUrl: 'http://localhost:1111/',
});
// Start mock server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
// Close mock server after all tests
afterAll(() => server.close());
// Reset handlers and global info after each test
afterEach(() => {
  resetFederationGlobalInfo();
  requestList.clear();
  server.resetHandlers();
});
