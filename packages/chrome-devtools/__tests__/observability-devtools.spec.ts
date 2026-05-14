import { describe, expect, it } from 'vitest';

import { mergeObservabilityReports } from '../src/utils/chrome/observability';
import {
  DEFAULT_OBSERVABILITY_DEVTOOLS_CONFIG,
  normalizeObservabilityDevtoolsConfig,
} from '../src/utils/chrome/observability-shared';

describe('observability devtools config', () => {
  it('defaults to development mode with verbose events', () => {
    expect(normalizeObservabilityDevtoolsConfig()).toMatchObject({
      enabled: true,
      level: 'verbose',
      browser: {
        enabled: true,
        mode: 'development',
      },
      trace: {
        printStart: true,
      },
    });
  });

  it('normalizes unsafe values and keeps valid production overrides', () => {
    expect(
      normalizeObservabilityDevtoolsConfig({
        ...DEFAULT_OBSERVABILITY_DEVTOOLS_CONFIG,
        level: 'summary',
        maxEvents: 5000,
        browser: {
          enabled: true,
          mode: 'production',
          scope: 'runtime host!',
        },
        react: {
          injectLoadedCallback: true,
          remoteIds: 'remote/Button, remote/Card',
        },
      }),
    ).toMatchObject({
      level: 'summary',
      maxEvents: 1000,
      browser: {
        mode: 'production',
        scope: 'runtime-host-',
      },
      react: {
        injectLoadedCallback: true,
        remoteIds: ['remote/Button', 'remote/Card'],
      },
    });
  });

  it('merges reports by trace id and keeps newest first', () => {
    const reports = mergeObservabilityReports(
      [
        {
          traceId: 'a',
          status: 'pending',
          startedAt: 1,
          updatedAt: 1,
          duration: 0,
          events: [],
        },
      ],
      [
        {
          traceId: 'a',
          status: 'success',
          startedAt: 1,
          updatedAt: 3,
          duration: 2,
          events: [],
        },
        {
          traceId: 'b',
          status: 'pending',
          startedAt: 2,
          updatedAt: 2,
          duration: 0,
          events: [],
        },
      ],
    );

    expect(reports.map((report) => report.traceId)).toEqual(['a', 'b']);
    expect(reports[0].status).toBe('success');
  });
});
