import { describe, expect, it } from 'vitest';

import { sanitizePostMessagePayload } from '../src/utils/chrome/safe-post-message';

describe('sanitizePostMessagePayload', () => {
  it('replaces functions and unsupported values with safe content', () => {
    const source = {
      fn: () => 'ok',
      nested: {
        value: 1,
        handler: function namedHandler() {
          return true;
        },
      },
      list: [undefined, Symbol('token'), 1n],
      error: new Error('boom'),
      regex: /mf/g,
    };

    expect(sanitizePostMessagePayload(source)).toMatchObject({
      fn: 'function(){}',
      nested: {
        value: 1,
        handler: 'function(){}',
      },
      list: ['[undefined]', 'Symbol(token)', '1'],
      error: {
        name: 'Error',
        message: 'boom',
      },
      regex: '/mf/g',
    });
  });

  it('handles circular data without throwing', () => {
    const source: Record<string, unknown> = {
      name: 'root',
    };
    source.self = source;
    source.map = new Map([['self', source]]);
    source.set = new Set([source]);

    expect(sanitizePostMessagePayload(source)).toEqual({
      name: 'root',
      self: '[circular]',
      map: [['self', '[circular]']],
      set: ['[circular]'],
    });
  });
});
