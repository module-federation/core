/**
 * forked from https://github.com/rspack-contrib/create-rstack
 * license at https://github.com/rspack-contrib/create-rstack/blob/main/LICENSE
 */
import path from 'path';
import fs from 'fs';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import {
  cancel,
  isCancel,
  multiselect,
  note,
  outro,
  select,
  text,
} from '@clack/prompts';
import minimist from 'minimist';
import { logger } from 'rslog';
import { FsMaterial } from './materials/FsMaterial';
import { HandlebarsAPI } from './handlebars';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageDir = path.resolve(__dirname, '..');

declare const __VERSION__: string;

const enum ProjectType {
  app = 'app',
  lib = 'lib',
  other = 'other',
}

const enum RoleType {
  consumer = 'consumer',
  provider = 'provider',
}

type Argv = {
  help?: boolean;
  dir?: string;
  template?: string;
  override?: boolean;
  name?: string;
  role?: RoleType;
};

const OTHER_TYPE: {
  [typeName: string]: {
    label: string;
    command: string;
    hint?: string;
  };
} = {
  zephyr: {
    label: 'zephyr',
    command: 'npm create zephyr@latest',
    hint: 'npm create zephyr@latest',
  },
};

type ProjectType = 'lib' | 'app' | 'zephyr';
type RoleType = 'consumer' | 'provider';
type AppTemplateName = 'modern' | 'rsbuild' | 'zephyr';
type ZephyrTemplateName = 'webpack' | 'rspack' | 'vite';
type LibTemplateName = 'rslib';

function upperFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function logHelpMessage(name: string, templates: string[]) {
  logger.log(`
   Usage: create-${name} [options]

   Options:

     -h, --help       display help for command
     -d, --dir        create project in specified directory
     -t, --template   specify the template to use
     -n, --name       specify the mf name
     -r, --role       specify the mf role type: provider or consumer
     --override       override files in target directory

   Templates:

     Standard Templates:
     ${templates.filter((t) => !t.startsWith('zephyr')).join(', ')}

     Zephyr Integration Templates:
     - Webpack: ${templates.filter((t) => t.startsWith('zephyr-webpack')).join(', ')}
     - Rspack: ${templates.filter((t) => t.startsWith('zephyr-rspack')).join(', ')}
     - Vite: ${templates.filter((t) => t.startsWith('zephyr-vite')).join(', ')}
`);
}

function pkgFromUserAgent(userAgent: string | undefined) {
  if (!userAgent) return undefined;
  const pkgSpec = userAgent.split(' ')[0];
  const pkgSpecArr = pkgSpec.split('/');
  return {
    name: pkgSpecArr[0],
    version: pkgSpecArr[1],
  };
}

function cancelAndExit() {
  cancel('Operation cancelled.');
  process.exit(0);
}

function checkCancel<T>(value: unknown) {
  if (isCancel(value)) {
    cancelAndExit();
  }
  return value as T;
}

/**
 * 1. Input: 'foo'
 *    Output: folder `<cwd>/foo`, `package.json#name` -> `foo`
 *
 * 2. Input: 'foo/bar'
 *    Output: folder -> `<cwd>/foo/bar` folder, `package.json#name` -> `bar`
 *
 * 3. Input: '@scope/foo'
 *    Output: folder -> `<cwd>/@scope/bar` folder, `package.json#name` -> `@scope/foo`
 *
 * 4. Input: './foo/bar'
 *    Output: folder -> `<cwd>/foo/bar` folder, `package.json#name` -> `bar`
 *
 * 5. Input: '/root/path/to/foo'
 *    Output: folder -> `'/root/path/to/foo'` folder, `package.json#name` -> `foo`
 */
function formatProjectName(input: string) {
  const formatted = input.trim().replace(/\/+$/g, '');
  return {
    packageName: input,
    targetDir: formatted,
  };
}

function isEmptyDir(path: string) {
  const files = fs.readdirSync(path);
  return files.length === 0 || (files.length === 1 && files[0] === '.git');
}

async function getAppTemplateName(
  {
    roleType,
    framework,
  }: {
    roleType: RoleType;
    framework: AppTemplateName;
  },
  { template }: Argv,
) {
  if (template) {
    return `${template}-ts`;
  }

  return `${roleType}-${framework}-ts`;
}

async function getZephyrTemplateName(
  {
    roleType,
  }: {
    roleType: RoleType;
  },
  { template }: Argv,
) {
  if (template) {
    return template;
  }

  const framework = checkCancel<ZephyrTemplateName>(
    await select({
      message: 'Select Zephyr integration',
      options: [
        { value: 'webpack', label: 'Webpack' },
        { value: 'rspack', label: 'Rspack' },
        { value: 'vite', label: 'Vite' },
      ],
    }),
  );

  return `zephyr-${framework}-${roleType}`;
}

async function getLibTemplateName({ template }: Argv) {
  if (template) {
    return `${template}-ts`;
  }

  const templateName = checkCancel<LibTemplateName>(
    await select({
      message: 'Select template',
      options: [{ value: 'rslib', label: 'Rslib' }],
    }),
  );

  type ExcludesFalse = <T>(x: T | false) => x is T;
  const tools = checkCancel<string[]>(
    await multiselect({
      message:
        'Select development tools (Use <space> to select, <enter> to continue)',
      required: false,
      options: [
        {
          value: 'storybook',
          label: 'Storybook',
        },
        // TODO: support Rspress Module doc in the future
      ].filter(Boolean as any as ExcludesFalse),
    }),
  );

  // not support consumer yet, only support consume by runtime api
  const roleType: RoleType = RoleType.provider;

  if (!tools || !Object.keys(tools).length) {
    return `${roleType}-${templateName}-ts`;
  }

  return `${roleType}-${templateName}-${tools[0]}-ts`;
}

function getTemplateName(
  {
    projectType,
    roleType,
    framework,
  }: {
    projectType: ProjectType;
    roleType: RoleType;
    framework: AppTemplateName;
  },
  args: Argv,
) {
  if (projectType === 'app') {
    return getAppTemplateName(
      {
        roleType,
        framework,
      },
      args,
    );
  } else if (projectType === 'zephyr') {
    return getZephyrTemplateName(
      {
        roleType,
      },
      args,
    );
  }
  return getLibTemplateName(args);
}

function getTemplateDir(templateName: string) {
  return `templates/${templateName}/`;
}

async function forgeTemplate({
  projectType,
  argv,
  templateParameters,
  distFolder,
}: {
  projectType: ProjectType;
  argv: Argv;
  templateParameters: Record<string, string>;
  distFolder: string;
}) {
  let framework: AppTemplateName = 'modern';
  let roleType: RoleType = RoleType.provider;

  if (!argv?.template && projectType === 'app') {
    framework = checkCancel<AppTemplateName>(
      await select({
        message: 'Select template',
        options: [
          { value: 'modern', label: 'Modern.js Framework' },
          { value: 'rsbuild', label: 'Rsbuild' },
        ],
      }),
    );

    roleType = checkCancel<RoleType>(
      await select({
        message: 'Please select the role of project you want to create:',
        initialValue: 'provider',
        options: [
          { value: 'consumer', label: 'Consumer' },
          { value: 'provider', label: 'Provider' },
        ],
      }),
    );
  } else if (projectType === 'zephyr') {
    framework = 'zephyr';

    roleType = checkCancel<RoleType>(
      await select({
        message: 'Please select the role of project you want to create:',
        initialValue: 'provider',
        options: [
          { value: 'consumer', label: 'Consumer' },
          { value: 'provider', label: 'Provider' },
        ],
      }),
    );
  }

  const templateName = await getTemplateName(
    {
      projectType,
      framework,
      roleType,
    },
    argv,
  );
  const material = new FsMaterial(packageDir);

  const renderTemplate = async (templateDir: string) => {
    const templatePattern = `${templateDir}**/*`;
    const resourceMap = await material.find(templatePattern, {
      nodir: true,
      dot: true,
    });

    const parameters = {
      ...templateParameters,
    };

    await Promise.all(
      Object.keys(resourceMap).map(async (resourceKey) => {
        const target = resourceKey
          .replace(templateDir, ``)
          .replace('.handlebars', ``);

        const handlebarsAPI = new HandlebarsAPI();
        await handlebarsAPI.renderTemplate(
          material.get(resourceKey),
          target,
          distFolder,
          {
            ...parameters,
          },
        );
      }),
    );
  };

  const templateDir = getTemplateDir(templateName);

  let commonTemplateDir = '';
  if (projectType === ProjectType.lib) {
    commonTemplateDir = 'templates/lib-common/';
  } else if (projectType === 'app') {
    commonTemplateDir = `templates/${framework}-common/`;
  }
  // Zephyr templates are self-contained without common templates

  // Only render common templates if they exist and are applicable
  if (commonTemplateDir) {
    await renderTemplate(commonTemplateDir);
  }
  await renderTemplate(templateDir);
}

async function getProjectType(template?: string) {
  if (!template) {
    return checkCancel<ProjectType>(
      await select({
        message: 'Please select the type of project you want to create:',
        options: [
          { value: ProjectType.app, label: 'Application' },
          { value: ProjectType.lib, label: 'Lib' },
          { value: ProjectType.other, label: 'Other' },
        ],
      }),
    );
  }

  if (template.startsWith('create-')) {
    return ProjectType.other;
  }

  if (template.includes('lib')) {
    return ProjectType.lib;
  }

  return ProjectType.app;
}

export async function create({
  name,
  templates,
}: {
  name: string;
  templates: string[];
}) {
  const argv = minimist<Argv>(process.argv.slice(2), {
    alias: { h: 'help', d: 'dir', t: 'template', n: 'name', r: 'role' },
  });

  console.log('');
  logger.greet(`◆  Create ${upperFirst(name)} Project`);

  if (argv.help) {
    logHelpMessage(name, templates);
    return;
  }

  const cwd = process.cwd();
  const pkgInfo = pkgFromUserAgent(process.env['npm_config_user_agent']);
  const pkgManager = pkgInfo ? pkgInfo.name : 'npm';
  const mfVersion = __VERSION__;

  const mfName =
    argv.name ||
    checkCancel<string>(
      await text({
        message: 'Please input Module Federation name:',
        placeholder: 'mf_project_name',
        defaultValue: 'mf_project_name',
        validate(value) {
          if (value.length === 0) {
            return 'Name is required';
          }
        },
      }),
    );

  const { targetDir } = formatProjectName(path.join(argv.dir || mfName));
  const distFolder = path.isAbsolute(targetDir)
    ? targetDir
    : path.join(cwd, targetDir);

  if (!argv.override && fs.existsSync(distFolder) && !isEmptyDir(distFolder)) {
    const option = checkCancel<string>(
      await select({
        message: `"${targetDir}" is not empty, please choose:`,
        options: [
          { value: 'yes', label: 'Continue and override files' },
          { value: 'no', label: 'Cancel operation' },
        ],
      }),
    );

    if (option === 'no') {
      cancelAndExit();
    }
  }

  const projectType = checkCancel<ProjectType>(
    await select({
      message: 'Please select the type of project you want to create:',
      options: [
        { value: 'app', label: 'Application' },
        { value: 'lib', label: 'Lib' },
        { value: 'zephyr', label: 'Zephyr Powered' },
      ],
    }),
  );

  const mfVersion = __VERSION__;

  await forgeTemplate({
    projectType,
    argv,
    templateParameters: {
      mfName,
      mfVersion,
    },
    distFolder,
  });

  const nextSteps = [
    `cd ${targetDir}`,
    `${pkgManager} install`,
    `${pkgManager} run ${projectType === ProjectType.lib ? 'mf-dev' : 'dev'}`,
  ];

  note(nextSteps.join('\n'), 'Next steps');

  outro('Done.');
}
