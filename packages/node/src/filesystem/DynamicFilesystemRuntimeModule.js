const { RuntimeModule, RuntimeGlobals, Template } = require('webpack');
import {
  fileSystemRunInContextStrategy,
  httpEvalStrategy,
  httpVmStrategy,
} from './stratagies';

class FileSystemRunInContextStrategyRuntimeModule extends RuntimeModule {
  constructor() {
    super('dynamic-file-system', RuntimeModule.STAGE_BASIC);
  }

  generate() {
    return Template.asString([
      fileSystemRunInContextStrategy.toString(),
      httpEvalStrategy.toString(),
      httpVmStrategy.toString(),
      'const loadChunkStrategy = async (strategyType,chunkId,rootOutputDir, remotes, callback) => {',
      Template.indent([
        'switch (strategyType) {',
        Template.indent([
          'case "filesystem": return await fileSystemRunInContextStrategy(chunkId,rootOutputDir, remotes, callback);',
          'case "http-eval": return await httpEvalStrategy(chunkId,rootOutputDir, remotes, callback);',
          'case "http-vm": return await httpVmStrategy(chunkId,rootOutputDir, remotes, callback);',
          'default: throw new Error("Invalid strategy type");',
        ]),
        '}',
      ]),
      '};',
    ]);
  }
}

export default FileSystemRunInContextStrategyRuntimeModule;
