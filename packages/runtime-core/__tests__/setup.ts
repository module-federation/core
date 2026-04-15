import 'whatwg-fetch';
import { server } from './mock/server';
import { requestList } from './mock/env';
import { resetFederationGlobalInfo } from '../src/global';

// Note: runtime-core tests may run in both `jsdom` and `node` environments.
// The script-DOM mocking module touches `window` at import-time, so we must
// only import it when a DOM is available.
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const { mockScriptDomResponse } = await import('./mock/mock-script');
  mockScriptDomResponse({
    baseDir: __dirname,
    baseUrl: 'http://localhost:1111/',
  });
}

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterAll(() => server.close());
afterEach(() => {
  resetFederationGlobalInfo();
  requestList.clear();
  server.resetHandlers();
});
