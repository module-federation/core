import { loadDependenciesTemplate } from './LoadDependenciesTemplate';
describe('loadDependencies (evaluated code)', () => {
  let logMock: jest.Mock;
  let originalConsoleLog: typeof console.log;

  beforeEach(() => {
    // Store the original console.log function
    originalConsoleLog = console.log;
    // Define a mock console.log function
    logMock = jest.fn();
    console.log = logMock;
  });

  afterEach(() => {
    // Restore the original console.log function
    console.log = originalConsoleLog;
  });

  it('should load dependencies correctly', async () => {
    const shareMap = {
      default: {
        libA: {
          '1.0.0': {
            loaded: false,
            get: () => Promise.resolve({ default: () => {} }),
          },
        },
        libB: {
          '2.0.0': {
            loaded: false,
            get: () => Promise.resolve({ default: () => {} }),
          },
        },
      },
    };

    expect(shareMap.default.libA['1.0.0'].get()).toBeInstanceOf(Promise);
    expect(shareMap.default.libA['1.0.0'].loaded).toBe(false);

    let testTemplate = "let preferredModules = ['libA'];";
    testTemplate += 'let asyncQueue = [];';
    // testTemplate += `sh areScopeMap = shareMap;`;
    testTemplate += loadDependenciesTemplate({
      shareScopeMap: `shareMap`,
    }).toString();
    testTemplate += '\n loadDependencies;';
    // Define the code to be evaluated

    // Define mock data for testing
    const mockLibKeys = [
      ['libA', '1.0.0'],
      ['libB', '2.0.0'],
    ];
    const mockCnn = 'testApp';

    // Evaluate the code to generate executable code
    const loadDependencies = eval(testTemplate);

    // Call the loadDependencies function (defined within the evaluated code)
    const dependencies = await loadDependencies(mockLibKeys, mockCnn);
    expect(shareMap.default.libA['1.0.0'].get()).toBeInstanceOf(Object);
    expect(shareMap.default.libA['1.0.0'].loaded).toBe(1);
    //@ts-ignore
    expect(shareMap.default.libB['2.0.0'].get().default).toBeInstanceOf(
      Function
    );
    // Assert that the console.log function was called with the expected arguments
    expect(logMock).toHaveBeenCalledWith(
      'loadDependencies',
      mockLibKeys,
      mockCnn
    );
    expect(logMock).toHaveBeenCalledWith('loading', 'libA', '1.0.0');
    expect(logMock).toHaveBeenCalledWith('loading', 'libB', '2.0.0');
    expect(logMock).toHaveBeenCalledWith('loaded', 'libA', '1.0.0');

    // Additional assertions can be added here to test other behaviors
  });
});
