/**
 * This is a minimal script to publish your package to "npm".
 * This is meant to be used as-is or customize as you see fit.
 *
 * This script is executed on "dist/path/to/library" as "cwd" by default.
 *
 * You might need to authenticate with NPM before running this script.
 */

import { createProjectGraphAsync } from '@nx/devkit';
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import chalk from 'chalk';

function invariant(condition, message) {
  if (!condition) {
    console.error(chalk.bold.red(message));
    process.exit(1);
  }
}

async function main() {
  // Executing publish script: node path/to/publish.mjs {name} --version {version} --tag {tag}
  // Default "tag" to "next" so we won't publish the "latest" tag by accident.
  const [, , name, version, tag = 'next'] = process.argv;

  // A simple SemVer validation to validate the version
  const validVersion = /^\d+\.\d+\.\d+(-\w+\.\d+)?/;
  invariant(
    version && validVersion.test(version),
    `No version provided or version did not match Semantic Versioning, expected: #.#.#-tag.# or #.#.#, got ${version}.`,
  );

  console.log(chalk.blue(`Publishing ${name}@${version} with tag: ${tag}`));

  // Create the project graph instead of reading cached version
  let graph;
  try {
    console.log(chalk.blue('Creating project graph...'));
    graph = await createProjectGraphAsync();
  } catch (error) {
    console.error(chalk.bold.red('Failed to create project graph:'), error);
    process.exit(1);
  }

  const project = graph.nodes[name];

  invariant(
    project,
    `Could not find project "${name}" in the workspace. Is the project.json configured correctly?`,
  );

  const outputPath = project.data?.targets?.build?.options?.outputPath;
  invariant(
    outputPath,
    `Could not find "build.options.outputPath" of project "${name}". Is project.json configured correctly?`,
  );

  console.log(chalk.blue(`Changing to output directory: ${outputPath}`));
  process.chdir(outputPath);

  // Updating the version in "package.json" before publishing
  try {
    const packageJsonPath = 'package.json';
    console.log(chalk.blue(`Updating version in ${packageJsonPath}`));

    const json = JSON.parse(readFileSync(packageJsonPath).toString());
    const oldVersion = json.version;
    json.version = version;
    writeFileSync(packageJsonPath, JSON.stringify(json, null, 2));

    console.log(
      chalk.green(`Updated version from ${oldVersion} to ${version}`),
    );
  } catch (e) {
    console.error(
      chalk.bold.red(
        `Error reading package.json file from library build output.`,
      ),
    );
    console.error(e);
    process.exit(1);
  }

  // Execute "npm publish" to publish
  try {
    console.log(
      chalk.blue(
        `Publishing with command: npm publish --access public --tag ${tag}`,
      ),
    );
    execSync(`npm publish --access public --tag ${tag}`, { stdio: 'inherit' });
    console.log(
      chalk.green(`Successfully published ${name}@${version} with tag: ${tag}`),
    );
  } catch (error) {
    console.error(chalk.bold.red('Failed to publish package:'), error);
    process.exit(1);
  }
}

// Run the main function and handle any unhandled errors
main().catch((error) => {
  console.error(chalk.bold.red('Unexpected error:'), error);
  process.exit(1);
});
