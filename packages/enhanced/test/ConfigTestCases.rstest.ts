import path from 'path';
import fs from 'graceful-fs';
import vm from 'vm';
import { URL, pathToFileURL, fileURLToPath } from 'url';
import { createRequire } from 'module';
import { rimrafSync } from 'rimraf';
import {
  describe,
  it,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  expect,
  rs,
} from '@rstest/core';

// Create a require function using __filename (available in CommonJS output mode)
const nativeRequire = createRequire(__filename);

// 预热 webpack（与原逻辑一致）
nativeRequire('./helpers/warmup-webpack');

const checkArrayExpectation = nativeRequire('./checkArrayExpectation');
const FakeDocument = nativeRequire('./helpers/FakeDocument');
const CurrentScript = nativeRequire('./helpers/CurrentScript');
const prepareOptions = nativeRequire('./helpers/prepareOptions');
const captureStdio = nativeRequire('./helpers/captureStdio');
const asModule = nativeRequire('./helpers/asModule');
const filterInfraStructureErrors = nativeRequire(
  './helpers/infrastructureLogErrors',
);
const { parseResource } = nativeRequire('webpack/lib/util/identifier');

const casesPath = path.join(__dirname, 'configCases');

const dedupeByMessage = (items: any[]) => {
  if (!Array.isArray(items) || items.length === 0) {
    return [] as any[];
  }
  const seen = new Set<string>();
  const deduped: any[] = [];
  for (const item of items) {
    const key = (item && item.message) as string | undefined;
    if (key) {
      if (seen.has(key)) continue;
      seen.add(key);
    }
    deduped.push(item);
  }
  return deduped;
};

const collectInfrastructureOutputs = (
  infraLogs: string[],
  stderrOutput: string | undefined,
  config: any,
) => {
  const infrastructureCollection = filterInfraStructureErrors.collect(
    infraLogs,
    config,
  );
  const stderrLines = stderrOutput
    ? stderrOutput
        .split(/\r?\n/)
        .map((line: string) => line.trim())
        .filter(Boolean)
    : [];
  const stderrCollection = filterInfraStructureErrors.collect(
    stderrLines,
    config,
  );
  const unhandled = [
    ...infrastructureCollection.entries
      .filter(
        (entry: any) => !infrastructureCollection.handled.has(entry.normalized),
      )
      .map((entry: any) => entry.normalized),
    ...stderrCollection.entries
      .filter((entry: any) => !stderrCollection.handled.has(entry.normalized))
      .map((entry: any) => entry.normalized),
  ];

  const combinedResults = dedupeByMessage([
    ...infrastructureCollection.results,
    ...stderrCollection.results,
  ]);

  return { unhandled, results: combinedResults };
};

const categories = fs.readdirSync(casesPath).map((cat: string) => {
  return {
    name: cat,
    tests: fs
      .readdirSync(path.join(casesPath, cat))
      .filter(
        (folder: string) => !folder.startsWith('_') && !folder.startsWith('.'),
      )
      .sort(),
  };
});

const createLogger = (appendTarget: string[]) => {
  return {
    log: (l: string) => appendTarget.push(l),
    debug: (l: string) => appendTarget.push(l),
    trace: (l: string) => appendTarget.push(l),
    info: (l: string) => appendTarget.push(l),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    logTime: () => {},
    group: () => {},
    groupCollapsed: () => {},
    groupEnd: () => {},
    profile: () => {},
    profileEnd: () => {},
    clear: () => {},
    status: () => {},
  };
};

export const describeCases = (config: any) => {
  describe(config.name, () => {
    let stderr: any;
    rs.setConfig({ testTimeout: 20000 });
    beforeEach(() => {
      stderr = captureStdio(process.stderr, true);
    });
    afterEach(() => {
      stderr.restore();
    });

    for (const category of categories) {
      describe(category.name, () => {
        for (const testName of category.tests) {
          describe(testName, () => {
            const testDirectory = path.join(casesPath, category.name, testName);
            const filterPath = path.join(testDirectory, 'test.filter.js');
            if (fs.existsSync(filterPath) && !require(filterPath)()) {
              it('filtered', () => undefined);
              return;
            }
            const infraStructureLog: string[] = [];
            const outBaseDir = path.join(__dirname, 'js');
            const testSubPath = path.join(config.name, category.name, testName);
            const outputDirectory = path.join(outBaseDir, testSubPath);
            const cacheDirectory = path.join(outBaseDir, '.cache', testSubPath);
            let options: any, optionsArr: any[], testConfig: any;

            beforeAll(() => {
              if (
                testDirectory.includes(
                  `${path.sep}tree-shaking-share${path.sep}`,
                )
              ) {
                nativeRequire('./scripts/ensure-reshake-fixtures');
              }
              options = prepareOptions(
                require(path.join(testDirectory, 'webpack.config.js')),
                {
                  testPath: outputDirectory,
                },
              );
              optionsArr = [].concat(options);
              optionsArr.forEach((opt: any, idx: number) => {
                // federation 选项注入
                if (config.federation) {
                  const mfp =
                    opt.plugins &&
                    opt.plugins.find(
                      (p: any) => p.name === 'ModuleFederationPlugin',
                    );
                  if (mfp) {
                    if (!mfp._options.experiments)
                      mfp._options.experiments = {};
                    if (config.federation?.asyncStartup) {
                      if ('asyncStartup' in mfp._options.experiments) {
                        // respect explicit setting
                      } else {
                        Object.assign(
                          mfp._options.experiments,
                          config.federation,
                        );
                      }
                    }
                  }
                }

                if (!opt.context) opt.context = testDirectory;
                if (!opt.mode) opt.mode = 'production';
                if (!opt.optimization) opt.optimization = {};
                if (opt.optimization.minimize === undefined)
                  opt.optimization.minimize = false;
                if (opt.optimization.minimizer === undefined) {
                  // 保留注释：不强制设置 minimizer
                }
                if (!opt.entry) opt.entry = './index.js';
                if (!opt.target) opt.target = 'async-node';
                if (!opt.output) opt.output = {};
                if (!opt.output.path) opt.output.path = outputDirectory;
                if (typeof opt.output.pathinfo === 'undefined')
                  opt.output.pathinfo = true;
                if (!opt.output.filename)
                  opt.output.filename =
                    'bundle' +
                    idx +
                    (opt.experiments && opt.experiments.outputModule
                      ? '.mjs'
                      : '.js');
                if (config.cache) {
                  opt.cache = {
                    cacheDirectory,
                    name: `config-${idx}`,
                    ...config.cache,
                  };
                  opt.infrastructureLogging = {
                    debug: true,
                    console: createLogger(infraStructureLog),
                  };
                }
                if (!opt.snapshot) opt.snapshot = {};
                if (!opt.snapshot.managedPaths) {
                  opt.snapshot.managedPaths = [
                    path.resolve(__dirname, '../node_modules'),
                  ];
                }
              });

              testConfig = {
                findBundle: function (
                  i: number,
                  options: any,
                ): string | undefined {
                  const ext = path.extname(
                    parseResource(options.output.filename).path,
                  );
                  if (
                    fs.existsSync(
                      path.join(options.output.path, 'bundle' + i + ext),
                    )
                  ) {
                    return './bundle' + i + ext;
                  }
                  return undefined;
                },
                timeout: 30000,
              };
              try {
                testConfig = Object.assign(
                  testConfig,
                  require(path.join(testDirectory, 'test.config.js')),
                );
              } catch (e) {
                // ignored
              }
            });

            afterAll(() => {
              options = undefined as any;
              optionsArr = undefined as any;
              testConfig = undefined as any;
            });

            beforeAll(() => {
              rimrafSync(cacheDirectory);
            });

            const handleFatalError = (err: any) => {
              const fakeStats = {
                errors: [
                  {
                    message: err.message,
                    stack: err.stack,
                  },
                ],
              } as any;
              // error 期望匹配
              if (
                checkArrayExpectation(
                  testDirectory,
                  fakeStats,
                  'error',
                  'Error',
                  (e: any) => {
                    throw e;
                  },
                )
              ) {
                return; // 让 rstest 认为测试通过（错误与期望一致）
              }
              // 否则抛出，交给 rstest 失败
              throw err;
            };

            // cache 预编译：第一次
            if (config.cache) {
              it(`${testName} should pre-compile to fill disk cache (1st)`, async () => {
                rimrafSync(outputDirectory);
                fs.mkdirSync(outputDirectory, { recursive: true });
                infraStructureLog.length = 0;
                await new Promise<void>((resolve, reject) => {
                  try {
                    // 单次 run
                    require('webpack')(options, (err: any) => {
                      const stderrOutput = stderr.toString();
                      const { unhandled, results: infrastructureLogErrors } =
                        collectInfrastructureOutputs(
                          infraStructureLog,
                          stderrOutput,
                          { run: 1, options },
                        );
                      stderr.reset();
                      if (unhandled.length) {
                        reject(
                          new Error(
                            'Errors/Warnings during build:\n' +
                              unhandled.join('\n'),
                          ),
                        );
                        return;
                      }
                      if (
                        infrastructureLogErrors.length &&
                        checkArrayExpectation(
                          testDirectory,
                          { infrastructureLogs: infrastructureLogErrors },
                          'infrastructureLog',
                          'infrastructure-log',
                          'InfrastructureLog',
                          (e: any) => {
                            throw e;
                          },
                        )
                      ) {
                        resolve();
                        return;
                      }
                      if (err) {
                        reject(err);
                        return;
                      }
                      resolve();
                    });
                  } catch (e: any) {
                    reject(e);
                  }
                });
              }, 60000);
              // cache 预编译：第二次
              it(`${testName} should pre-compile to fill disk cache (2nd)`, async () => {
                rimrafSync(outputDirectory);
                fs.mkdirSync(outputDirectory, { recursive: true });
                infraStructureLog.length = 0;
                await new Promise<void>((resolve, reject) => {
                  try {
                    require('webpack')(options, (err: any, stats: any) => {
                      if (err) {
                        reject(err);
                        return;
                      }
                      const { modules, children, errorsCount } = stats.toJson({
                        all: false,
                        modules: true,
                        errorsCount: true,
                      });
                      const stderrOutput = stderr.toString();
                      const { unhandled, results: infrastructureLogErrors } =
                        collectInfrastructureOutputs(
                          infraStructureLog,
                          stderrOutput,
                          { run: 2, options },
                        );
                      stderr.reset();
                      if (errorsCount === 0) {
                        if (unhandled.length) {
                          reject(
                            new Error(
                              'Errors/Warnings during build:\n' +
                                unhandled.join('\n'),
                            ),
                          );
                          return;
                        }
                        const allModules = children
                          ? children.reduce(
                              (all: any[], { modules }: any) =>
                                all.concat(modules),
                              modules || [],
                            )
                          : modules;
                        if (
                          allModules.some(
                            (m: any) =>
                              m.type !== 'cached modules' && !m.cached,
                          )
                        ) {
                          reject(
                            new Error(
                              `Some modules were not cached:\n${stats.toString({ all: false, modules: true, modulesSpace: 100 })}`,
                            ),
                          );
                          return;
                        }
                      }
                      if (
                        infrastructureLogErrors.length &&
                        checkArrayExpectation(
                          testDirectory,
                          { infrastructureLogs: infrastructureLogErrors },
                          'infrastructureLog',
                          'infrastructure-log',
                          'InfrastructureLog',
                          (e: any) => {
                            throw e;
                          },
                        )
                      ) {
                        resolve();
                        return;
                      }
                      resolve();
                    });
                  } catch (e: any) {
                    reject(e);
                  }
                });
              }, 40000);
            }

            it(
              `${testName} should compile`,
              async () => {
                try {
                  // Robust cleanup to avoid ENOTEMPTY and race conditions
                  (fs as any).rmSync?.(outputDirectory, {
                    recursive: true,
                    force: true,
                  });
                } catch {
                  try {
                    rimrafSync(outputDirectory);
                  } catch {
                    /* ignore */
                  }
                }
                fs.mkdirSync(outputDirectory, { recursive: true });
                infraStructureLog.length = 0;

                // 运行 webpack
                const { stats } = await new Promise<{ stats: any }>(
                  (resolve, reject) => {
                    const onCompiled = (err: any, stats: any) => {
                      if (err) return reject(err);
                      resolve({ stats });
                    };
                    try {
                      if (config.cache) {
                        const compiler = require('webpack')(options);
                        compiler.run((err: any) => {
                          if (err) return reject(err);
                          compiler.run((error: any, stats: any) => {
                            compiler.close((cerr: any) => {
                              if (cerr) return reject(cerr);
                              if (error) return reject(error);
                              resolve({ stats });
                            });
                          });
                        });
                      } else {
                        require('webpack')(options, onCompiled);
                      }
                    } catch (e: any) {
                      reject(e);
                    }
                  },
                ).catch((e) => {
                  handleFatalError(e);
                  throw e; // rethrow for rstest to mark failure otherwise
                });

                // 写入 stats
                const statOptions = { preset: 'verbose', colors: false };
                fs.mkdirSync(outputDirectory, { recursive: true });
                fs.writeFileSync(
                  path.join(outputDirectory, 'stats.txt'),
                  stats.toString(statOptions),
                  'utf-8',
                );
                const jsonStats = stats.toJson({ errorDetails: true });
                try {
                  fs.writeFileSync(
                    path.join(outputDirectory, 'stats.json'),
                    JSON.stringify(jsonStats, null, 2),
                    'utf-8',
                  );
                } catch {}

                // 错误/警告/infra/deprecation 检查
                if (
                  checkArrayExpectation(
                    testDirectory,
                    jsonStats,
                    'error',
                    'Error',
                    (e: any) => {
                      throw e;
                    },
                  )
                ) {
                  return;
                }
                if (
                  checkArrayExpectation(
                    testDirectory,
                    jsonStats,
                    'warning',
                    'Warning',
                    (e: any) => {
                      throw e;
                    },
                  )
                ) {
                  return;
                }
                const stderrOutput = stderr.toString();
                const { unhandled, results: infrastructureLogErrors } =
                  collectInfrastructureOutputs(
                    infraStructureLog,
                    stderrOutput,
                    { run: 3, options },
                  );
                stderr.reset();
                if (unhandled.length) {
                  throw new Error(
                    'Errors/Warnings during build:\n' + unhandled.join('\n'),
                  );
                }
                if (
                  checkArrayExpectation(
                    testDirectory,
                    { deprecations: [] },
                    'deprecation',
                    'Deprecation',
                    (e: any) => {
                      throw e;
                    },
                  )
                ) {
                  return;
                }
                if (
                  infrastructureLogErrors.length &&
                  checkArrayExpectation(
                    testDirectory,
                    { infrastructureLogs: infrastructureLogErrors },
                    'infrastructureLog',
                    'infrastructure-log',
                    'InfrastructureLog',
                    (e: any) => {
                      throw e;
                    },
                  )
                ) {
                  return;
                }

                // 执行 bundle 并收集导出的 it/beforeEach/afterEach（行为对齐 Jest harness）
                let filesCount = 0;
                if (testConfig.noTests) return; // 某些 case 明确无测试
                if (testConfig.beforeExecute) testConfig.beforeExecute();

                type Hook = () => any;
                type CallbackTestFn = (done: (err?: any) => void) => void;
                type PromiseTestFn = () => any | Promise<any>;
                type TestFn = CallbackTestFn | PromiseTestFn;
                type TestItem = { name: string; fn: TestFn; timeout?: number };
                const hooksBefore: Hook[] = [];
                const hooksAfter: Hook[] = [];
                const collectedTests: TestItem[] = [];

                let runTests = -1;
                let numberOfTests = 0;
                let globalTimeout = 10000;
                const disposables: Array<() => void> = [];
                const createDisposableFn = (fn: any, isTest?: boolean) => {
                  if (!fn) return null;
                  let rfn: any;
                  if (fn.length >= 1) {
                    rfn = (done: (err?: any) => void) => {
                      fn((...args: any[]) => {
                        if (isTest) runTests++;
                        done(...args);
                      });
                    };
                  } else {
                    rfn = () => {
                      const r = fn();
                      if (isTest) runTests++;
                      return r;
                    };
                  }
                  disposables.push(() => {
                    fn = null;
                  });
                  return rfn;
                };

                const caseIt = (name: string, fn: TestFn, timeout?: number) => {
                  numberOfTests++;
                  if (runTests >= numberOfTests)
                    throw new Error('it called too late');
                  const wrapped = createDisposableFn(fn, true) as TestFn;
                  collectedTests.push({
                    name,
                    fn: wrapped,
                    timeout: timeout || globalTimeout,
                  });
                };
                const caseBeforeEach = (fn: Hook) => {
                  if (runTests >= numberOfTests)
                    throw new Error('beforeEach called too late');
                  hooksBefore.push(createDisposableFn(fn, false) as Hook);
                };
                const caseAfterEach = (fn: Hook) => {
                  if (runTests >= numberOfTests)
                    throw new Error('afterEach called too late');
                  hooksAfter.push(createDisposableFn(fn, false) as Hook);
                };
                const setDefaultTimeout = (time: number) => {
                  globalTimeout = time;
                };
                const getNumberOfTests = () => numberOfTests;

                const isCallbackStyle = (fn: TestFn): fn is CallbackTestFn =>
                  fn.length >= 1;
                const runMaybeDone = async (fn: TestFn, timeout?: number) => {
                  if (!fn) return;
                  const run = async () => {
                    if (isCallbackStyle(fn)) {
                      await new Promise<void>((resolve, reject) => {
                        try {
                          fn((err?: any) => (err ? reject(err) : resolve()));
                        } catch (e) {
                          reject(e);
                        }
                      });
                    } else {
                      const r = (fn as PromiseTestFn)();
                      if (r && typeof r.then === 'function') await r;
                    }
                  };
                  if (!timeout) {
                    await run();
                    return;
                  }
                  await Promise.race([
                    run(),
                    new Promise<void>((_, reject) => {
                      setTimeout(() => {
                        reject(new Error('Test timed out'));
                      }, timeout);
                    }),
                  ]);
                };

                const results: any[] = [];
                for (let i = 0; i < optionsArr.length; i++) {
                  const opt = optionsArr[i];
                  const bundlePath = testConfig.findBundle(i, optionsArr[i]);
                  if (bundlePath) {
                    filesCount++;
                    const document = new FakeDocument(outputDirectory);
                    const globalContext = {
                      console: console,
                      expect: expect,
                      setTimeout: setTimeout,
                      clearTimeout: clearTimeout,
                      document,
                      getComputedStyle:
                        document.getComputedStyle.bind(document),
                      location: {
                        href: 'https://test.cases/path/index.html',
                        origin: 'https://test.cases',
                        toString() {
                          return 'https://test.cases/path/index.html';
                        },
                      },
                    } as any;

                    const requireCache: Record<string, any> =
                      Object.create(null);
                    const esmCache = new Map<string, any>();
                    const esmIdentifier = `${category.name}-${testName}-${i}`;
                    const baseModuleScope: any = {
                      console: console,
                      it: caseIt,
                      beforeEach: caseBeforeEach,
                      afterEach: caseAfterEach,
                      expect,
                      jest: {
                        resetModules: () => rs.resetModules(),
                        setTimeout: (...args: any[]) =>
                          (setTimeout as any)(...args),
                      },
                      __STATS__: jsonStats,
                      nsObj: (m: any) => {
                        Object.defineProperty(m, Symbol.toStringTag, {
                          value: 'Module',
                        });
                        return m;
                      },
                    };

                    let runInNewContext = false;
                    if (opt.target === 'web' || opt.target === 'webworker') {
                      baseModuleScope.window = globalContext;
                      baseModuleScope.self = globalContext;
                      baseModuleScope.document = globalContext.document;
                      baseModuleScope.setTimeout = globalContext.setTimeout;
                      baseModuleScope.clearTimeout = globalContext.clearTimeout;
                      baseModuleScope.URL = URL;
                      baseModuleScope.Worker = nativeRequire(
                        './helpers/createFakeWorker',
                      )({
                        outputDirectory,
                      });
                      runInNewContext = true;
                    }
                    if (testConfig.moduleScope) {
                      testConfig.moduleScope(baseModuleScope);
                    }
                    const esmContext = vm.createContext(baseModuleScope, {
                      name: 'context for esm',
                    });

                    const executeBundle = (entryRel: string) => {
                      const _require = (
                        currentDirectory: string,
                        opt: any,
                        module: any,
                        esmMode?: 'evaluated' | 'unlinked',
                        parentModule?: any,
                      ): any => {
                        if (testConfig === undefined) {
                          throw new Error(
                            `_require(${module}) called after all tests from ${category.name} ${testName} have completed`,
                          );
                        }
                        if (Array.isArray(module) || /^\.\.?\//.test(module)) {
                          let content = '';
                          let p = '';
                          let subPath = '';
                          if (Array.isArray(module)) {
                            p = path.join(
                              currentDirectory,
                              '.array-require.js',
                            );
                            content = `module.exports = (${module
                              .map(
                                (arg: any) =>
                                  `require(${JSON.stringify(`./${arg}`)})`,
                              )
                              .join(', ')});`;
                          } else {
                            p = path.join(currentDirectory, module);
                            content = fs.readFileSync(p, 'utf-8');
                            const lastSlash = module.lastIndexOf('/');
                            let firstSlash = module.indexOf('/');
                            if (lastSlash !== -1 && firstSlash !== lastSlash) {
                              if (firstSlash !== -1) {
                                let next = module.indexOf('/', firstSlash + 1);
                                let dir = module.slice(firstSlash + 1, next);
                                while (dir === '.') {
                                  firstSlash = next;
                                  next = module.indexOf('/', firstSlash + 1);
                                  dir = module.slice(firstSlash + 1, next);
                                }
                              }
                              subPath = module.slice(
                                firstSlash + 1,
                                lastSlash + 1,
                              );
                            }
                          }

                          // Follow original template: ESM only when .mjs and outputModule enabled
                          const isModule =
                            p.endsWith('.mjs') &&
                            opt.experiments &&
                            opt.experiments.outputModule;
                          if (isModule) {
                            if (!vm.SourceTextModule)
                              throw new Error(
                                "Running this test requires '--experimental-vm-modules'.\nRun with 'node --experimental-vm-modules node_modules/jest-cli/bin/jest'.",
                              );
                            let esm = esmCache.get(p);
                            if (!esm) {
                              esm = new vm.SourceTextModule(content, {
                                identifier: esmIdentifier + '-' + p,
                                url:
                                  pathToFileURL(p).href + '?' + esmIdentifier,
                                context: esmContext,
                                initializeImportMeta: (meta: any) => {
                                  meta.url = pathToFileURL(p).href;
                                },
                                importModuleDynamically: async (
                                  specifier: string,
                                  mod: any,
                                ) => {
                                  const result = await _require(
                                    path.dirname(p),
                                    opt,
                                    specifier,
                                    'evaluated',
                                    mod,
                                  );
                                  return await asModule(result, mod.context);
                                },
                              } as any);
                              esmCache.set(p, esm);
                            }
                            if (esmMode === 'unlinked') return esm;
                            return (async () => {
                              await esm.link(
                                async (
                                  specifier: string,
                                  referencingModule: any,
                                ) => {
                                  return await asModule(
                                    await _require(
                                      path.dirname(
                                        referencingModule.identifier
                                          ? referencingModule.identifier.slice(
                                              esmIdentifier.length + 1,
                                            )
                                          : fileURLToPath(
                                              referencingModule.url,
                                            ),
                                      ),
                                      opt,
                                      specifier,
                                      'unlinked',
                                      referencingModule,
                                    ),
                                    referencingModule.context,
                                    true,
                                  );
                                },
                              );
                              if ((esm as any).instantiate)
                                (esm as any).instantiate();
                              await esm.evaluate();
                              if (esmMode === 'evaluated') return esm as any;
                              const ns = (esm as any).namespace;
                              return ns.default && ns.default instanceof Promise
                                ? ns.default
                                : ns;
                            })();
                          } else {
                            if (p in requireCache) {
                              return requireCache[p].exports;
                            }
                            const m = { exports: {} } as any;
                            requireCache[p] = m;
                            const moduleScope: any = {
                              ...baseModuleScope,
                              require: _require.bind(
                                null,
                                path.dirname(p),
                                opt,
                              ),
                              importScripts: (url: string) => {
                                expect(url).toMatch(
                                  /^https:\/\/test\.cases\/path\//,
                                );
                                _require(
                                  outputDirectory,
                                  opt,
                                  `.${url.slice('https://test.cases/path'.length)}`,
                                );
                              },
                              module: m,
                              exports: m.exports,
                              __dirname: path.dirname(p),
                              __filename: p,
                              _globalAssign: { expect },
                            };
                            if (testConfig.moduleScope)
                              testConfig.moduleScope(moduleScope);
                            if (!runInNewContext)
                              content = `Object.assign(global, _globalAssign); ${content}`;
                            const args = Object.keys(moduleScope);
                            const argValues = args.map(
                              (arg) => moduleScope[arg],
                            );
                            const code = `(function(${args.join(
                              ', ',
                            )}) {${content}\n})`;
                            const oldCurrentScript = document.currentScript;
                            (document as any).currentScript = new CurrentScript(
                              subPath,
                            );
                            const fn = runInNewContext
                              ? vm.runInNewContext(
                                  code,
                                  globalContext as any,
                                  p,
                                )
                              : vm.runInThisContext(code, p);
                            fn.call(
                              testConfig.nonEsmThis
                                ? testConfig.nonEsmThis(module)
                                : m.exports,
                              ...argValues,
                            );
                            (document as any).currentScript = oldCurrentScript;
                            return m.exports;
                          }
                        } else if (
                          testConfig.modules &&
                          module in testConfig.modules
                        ) {
                          return testConfig.modules[module];
                        } else {
                          return nativeRequire(
                            module.startsWith('node:')
                              ? module.slice(5)
                              : module,
                          );
                        }
                      };

                      const target = entryRel.startsWith('./')
                        ? entryRel
                        : './' + entryRel;
                      results.push(_require(outputDirectory, opt, target));
                    };

                    if (Array.isArray(bundlePath)) {
                      for (const bundlePathItem of bundlePath) {
                        executeBundle(bundlePathItem);
                      }
                    } else {
                      executeBundle(bundlePath);
                    }
                  }
                }

                if (
                  !jsonStats.errors.length &&
                  filesCount !== optionsArr.length
                ) {
                  throw new Error(
                    'Should have found at least one bundle file per webpack config',
                  );
                }

                // Wait for async bundles to complete (important for asyncStartup mode)
                await Promise.all(results);

                // Run afterExecute before checking collected tests.
                // Some cases (e.g. SystemJS) rely on afterExecute to trigger
                // deferred module evaluation which registers it() calls.
                try {
                  if (testConfig.afterExecute) testConfig.afterExecute();
                } catch {}

                // simulate the placeholder test used in createLazyTestEnv
                runTests = 0;

                if (collectedTests.length > 0) {
                  for (const t of collectedTests) {
                    for (const b of hooksBefore) {
                      await runMaybeDone(b, t.timeout);
                    }
                    await runMaybeDone(t.fn, t.timeout);
                    for (const a of hooksAfter) {
                      await runMaybeDone(a, t.timeout);
                    }
                  }
                }

                for (const key of Object.keys(global)) {
                  if (key.includes('webpack')) delete (global as any)[key];
                }

                if (getNumberOfTests() < filesCount) {
                  throw new Error('No tests exported by test case');
                }

                for (const dispose of disposables) {
                  dispose();
                }
              },
              testConfig?.timeout || 30000,
            );
          });
        }
      });
    }
  });
};
