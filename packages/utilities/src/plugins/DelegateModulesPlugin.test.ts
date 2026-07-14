import DelegateModulesPlugin from './DelegateModulesPlugin';

describe('DelegateModulesPlugin', () => {
  it.each(['webpack', 'rspack'])(
    'collects %s container reference modules as delegates',
    (bundler) => {
      const remoteModule = {
        identifier: () => `${bundler}/container/reference/app2`,
        userRequest: `${bundler}/container/reference/app2`,
      };
      const finishModules = {
        tapAsync: jest.fn(
          (
            _name,
            handler: (modules: unknown[], callback: () => void) => void,
          ) => handler([remoteModule], jest.fn()),
        ),
      };
      const compilation = {
        hooks: {
          finishModules,
          optimizeChunks: { tap: jest.fn() },
        },
      };
      const compiler = {
        hooks: {
          thisCompilation: {
            tap: jest.fn((_name, handler) => handler(compilation)),
          },
        },
      };
      const plugin = new DelegateModulesPlugin({});

      plugin.apply(compiler as never);

      expect(plugin._delegateModules.get(remoteModule.identifier())).toBe(
        remoteModule,
      );
    },
  );
});
