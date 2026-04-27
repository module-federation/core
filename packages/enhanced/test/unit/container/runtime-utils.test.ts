/*
 * @rstest-environment node
 */

import { normalizeRuntimeInitOptionsWithOutShared } from '../../../src/lib/container/runtime/utils';

describe('normalizeRuntimeInitOptionsWithOutShared', () => {
  it('includes the full security options when configured', () => {
    const allowedRemoteOrigins = ['localhost', 'https://cdn.example.com'];
    const security = {
      allowedRemoteOrigins,
      customPolicy: {
        mode: 'strict',
      },
    };
    const options = normalizeRuntimeInitOptionsWithOutShared({
      name: 'test-container',
      remotes: {},
      security,
    } as any);

    expect(options.security).toEqual(security);
    expect(options.security).not.toBe(security);
    expect(options.security?.allowedRemoteOrigins).not.toBe(
      allowedRemoteOrigins,
    );
    expect(options.security?.customPolicy).not.toBe(security.customPolicy);
  });

  it('omits security when it is not configured', () => {
    const options = normalizeRuntimeInitOptionsWithOutShared({
      name: 'test-container',
      remotes: {},
    } as any);

    expect(options.security).toBeUndefined();
  });
});
