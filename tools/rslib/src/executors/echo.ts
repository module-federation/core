import { PromiseExecutor } from '@nx/devkit';
import { EchoExecutorSchema } from './schema';

const runExecutor: PromiseExecutor<EchoExecutorSchema> = async (options) => {
  console.log('Executor ran for Echo', options);
  return {
    success: true,
  };
};

export default runExecutor;
