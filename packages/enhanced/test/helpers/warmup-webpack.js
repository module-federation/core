// Use Vitest globals (describe/it/expect) via test.globals=true
describe('warmup', () => {
  it('should warmup webpack', async () => {
    const webpack = require('webpack');
    const END = new Error('end warmup');
    await new Promise((resolve, reject) => {
      webpack(
        {
          entry: "data:text/javascript,import 'data:text/javascript,'",
          plugins: [
            (c) =>
              c.hooks.emit.tap('Warmup', () => {
                throw END;
              }),
          ],
        },
        (err) => {
          try {
            expect(err).toBe(END);
            resolve(undefined);
          } catch (e) {
            reject(e);
          }
        },
      );
    });
  }, 300000);
});
/* global describe, it, expect */
('use strict');
