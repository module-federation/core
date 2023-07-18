it('should add and remove delegate modules correctly', () => {
  const plugin = new DelegateModulesPlugin({
    runtime: 'runtime',
    container: 'container',
    remotes: {
      remote1: 'internal /path/to/remote1',
      remote2: 'internal /path/to/remote2',
    },
  });

  const compiler = createMockCompiler();
  const compilation = createMockCompilation();

  // Mock getChunkByName
  jest.spyOn(plugin, 'getChunkByName').mockImplementation((chunks, name) => chunks.find(chunk => chunk.name === name));

  plugin.apply(compiler);

  // Call the compilation tap function
  (compiler.hooks.compilation.tap as jest.Mock).mock.calls[0][1](compilation);

  // Call the finishModules tap function
  (compilation.hooks.finishModules.tapAsync as jest.Mock).mock.calls[0][1](
    [
      createMockModule('/path/to/remote1'),
      createMockModule('/path/to/remote2'),
      createMockModule('/path/to/non-delegate-module'),
    ],
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    () => {}
  );

  // Check if delegate modules are added
  expect(plugin['_delegateModules'].size).toBe(2);

  // Call the optimizeChunks tap function
  (compilation.hooks.optimizeChunks.tap as jest.Mock).mock.calls[0][1]([
    { name: 'runtime', hasRuntime: () => true },
    { name: 'container', hasRuntime: () => false },
  ]);

  // Check if getChunkByName was called
  expect((plugin.getChunkByName as jest.Mock)).toHaveBeenCalledTimes(2);

  // Check if connectChunkAndModule was called
  expect(compilation.chunkGraph.connectChunkAndModule).toHaveBeenCalledTimes(
    4
  );

  // Check if disconnectChunkAndModule was called
  expect(
    compilation.chunkGraph.disconnectChunkAndModule
  ).toHaveBeenCalledTimes(2);
});
