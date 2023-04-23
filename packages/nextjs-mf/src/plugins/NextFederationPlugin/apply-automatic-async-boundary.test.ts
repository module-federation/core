import { applyAutomaticAsyncBoundary } from './apply-automatic-async-boundary';
import {
  ModuleFederationPluginOptions,
  NextFederationPluginExtraOptions,
} from '@module-federation/utilities';
import path from 'path';
import webpack from 'webpack';
import { regexEqual } from './regex-equal';
describe('applyAutomaticAsyncBoundary', () => {
  const mockCompiler: webpack.Compiler = {
    options: {
      module: {
        rules: [
          {
            oneOf: [
              {
                test: /\.(tsx|ts|js|cjs|mjs|jsx)$/,
                use: 'mock-loader',
              },
            ],
          },
        ],
      },
    },
    context: path.join(__dirname, 'mock-app'),
    hooks: {},
  } as unknown as webpack.Compiler;

  const mockOptions: ModuleFederationPluginOptions = {
    name: 'mockApp',
    library: { type: 'var', name: 'mockApp' },
    filename: 'remoteEntry.js',
    exposes: {},
    shared: {},
  };

  const mockExtraOptions: NextFederationPluginExtraOptions = {
    automaticAsyncBoundary: true,
  };

  it('should modify the webpack configuration for async boundaries', () => {
    applyAutomaticAsyncBoundary(mockOptions, mockExtraOptions, mockCompiler);

    const jsRules = mockCompiler.options.module.rules.find((r) => {
      //@ts-ignore
      return r && r.oneOf;
    });

    //@ts-ignore
    const foundJsLayer = jsRules.oneOf.find((r) => {
      return regexEqual(r.test, /\.(tsx|ts|js|cjs|mjs|jsx)$/);
    });

    expect(jsRules).toBeDefined();
    expect(foundJsLayer).toBeDefined();
    //@ts-ignore
    expect(jsRules.oneOf.length).toBe(2);
    //@ts-ignore
    const newRule = jsRules.oneOf[0];

    expect(newRule.test).toBeDefined();
    expect(newRule.exclude).toBeDefined();
    expect(newRule.resourceQuery).toBeDefined();
    expect(newRule.use).toBeDefined();
  });

  it('should not modify webpack configuration if there is no js rule', () => {
    const noJsCompiler = { ...mockCompiler };
    //@ts-ignore
    noJsCompiler.options.module.rules[0].oneOf = [];
    //@ts-ignore
    applyAutomaticAsyncBoundary(mockOptions, mockExtraOptions, noJsCompiler);

    const jsRules = noJsCompiler.options.module.rules.find((r) => {
      //@ts-ignore
      return r && r.oneOf;
    });
    //@ts-ignore
    expect(jsRules.oneOf.length).toBe(0);
  });
});
