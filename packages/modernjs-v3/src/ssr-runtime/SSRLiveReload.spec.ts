import { afterEach, beforeEach, describe, expect, it, rs } from '@rstest/core';
import { SSRLiveReload } from './SSRLiveReload';

describe('SSRLiveReload', () => {
  beforeEach(() => {
    rs.stubEnv('NODE_ENV', 'development');
  });

  afterEach(() => {
    rs.unstubAllEnvs();
    rs.unstubAllGlobals();
  });

  it('renders the reload script on the server', () => {
    expect(SSRLiveReload()?.type).toBe('script');
  });

  it('renders the reload script when Modern.js hydrates server markup', () => {
    rs.stubGlobal('window', { _SSR_DATA: { renderLevel: 2 } });

    expect(SSRLiveReload()?.type).toBe('script');
  });

  it('renders nothing when Modern.js renders the root on the client', () => {
    rs.stubGlobal('window', {});

    expect(SSRLiveReload()).toBeNull();
  });
});
