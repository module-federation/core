describe('warmup', () => {
  it('should warmup webpack', async () => {
    let webpack = require('../../');
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
          webpack = undefined;
          try {
            expect(err).toBe(END);
            resolve();
          } catch (e) {
            reject(e);
          }
        },
      );
    });
  }, 300000);
});
