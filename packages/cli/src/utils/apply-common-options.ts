import type { Command } from 'commander';

export const applyCommonOptions = (command: Command) => {
  command.option(
    '-c --config <config>',
    'specify the configuration file, can be a relative or absolute path',
  );
  command.option(
    '-m --mode <mode>',
    'Specify the runtime environment. You can choose "dev" or "prod". The default value is "dev". After setting, the process.env.NODE_ENV environment variable will be automatically injected with "development" or "production" according to the value.',
    (value) => {
      const validChoices = {
        dev: 'development',
        prod: 'production',
      };
      if (!Object.keys(validChoices).includes(value)) {
        throw new Error(
          `Invalid mode: ${value}. Valid choices are: ${Object.keys(validChoices).join(', ')}`,
        );
      }
      const targetEnv = validChoices[value as keyof typeof validChoices];
      if (process.env.NODE_ENV !== targetEnv) {
        console.log(`process.env.NODE_ENV is set to ${targetEnv}`);
      }
      process.env.NODE_ENV = targetEnv;
      return value;
    },
    'dev',
  );
};
