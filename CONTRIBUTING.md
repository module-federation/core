# Module Federation Contributing Guide

Thank you for your interest in contributing to Module Federation! Before starting your contribution, please take a moment to read the following guidelines.

## Sending a Pull Request

1. [Fork](https://help.github.com/articles/fork-a-repo/) the Module Federation repository into your own GitHub account.
2. [Clone](https://help.github.com/articles/cloning-a-repository/) the repository to your local machine.
3. Checkout a new branch from `main` or `canary`.
4. Set up the development environment. Refer to the "Setup Development Environment" section below for guidance.
5. If you've fixed a bug or added code that should be tested, add some tests.
6. Ensure all tests pass. See the "Testing" section below for more information.
7. Run `nx format:write` and `nx affected -t lint --parallel=7 --exclude='*,!tag:type:pkg'` to check and fix the code style.
8. If you've changed Node.js packages, run `npm run commit` for semantic versioning and commit.
9. Submit the Pull Request, ensuring all CI runs pass.
10. Your Pull Request will be reviewed by the maintainers soon.

**Note:** 
- Keep your PRs concise, addressing a single issue or feature.
- Include a detailed description in your PR and link to related issues.

## Setup Development Environment

### Install Node.js

We recommend using Node.js 18 LTS. Check your Node.js version with `node -v`.

To install Node.js, use [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm):

```bash
# Install Node.js 18 LTS
nvm install 18 --lts
nvm alias default 18
nvm use 18
```

### Install Dependencies

```sh
# Enable pnpm with corepack, only available on Node.js >= `v14.19.0`
corepack enable
```

Add nx to global

```bash
pnpm add nx@latest -g
```

First, install NX globally:

```sh
pnpm install
```

What this will do:

- Install all dependencies
- Create symlinks between packages in the monorepo


## Testing

Testing is a crucial part of the development process in Module Federation. Here's how you can run tests:

### Running All Tests

To execute all test suites in the project, use:

```sh
npx nx run-many -t test --parallel=3
```

This command runs every test across all projects in the repository.

### Running Tests for Specific Projects

If you need to run tests for a specific project, use:

```sh
npx nx run-many -t test --parallel=3 --projects=PROJECT-NAME
```

Replace `PROJECT-NAME` with the actual name of the project you want to test. The `--parallel=3` flag allows simultaneous execution of up to 3 test suites, improving the overall testing speed.

### Running Impacted Tests

To run tests only for the projects affected by recent changes, use:

```sh
npx nx affected -t test --parallel=3 --exclude='*,!tag:type:pkg'
```

This command ensures that only relevant tests are executed, saving time and resources.

### Enhanced (packages/enhanced) Test Suites

The enhanced package uses Vitest with a custom runner that compiles webpack config cases and then executes their bundles in an isolated VM context.

- Run all enhanced tests

```sh
nx test enhanced
```

- Run a single enhanced case (by directory name)

```sh
# Example: only run the container/0-container-full case
npx vitest -c packages/enhanced/vitest.config.ts -t "0-container-full should compile"

# Or target a specific test file and group
npx vitest -c packages/enhanced/vitest.config.ts packages/enhanced/test/ConfigTestCases.basictest.vitest.ts -t "0-container-full should compile"
npx vitest -c packages/enhanced/vitest.config.ts packages/enhanced/test/ConfigTestCases.embedruntime.vitest.ts -t "0-container-full should compile"
```

- Notes
  - Filters match the top-level test names created by the runner (e.g., `<case-name> should compile`).
  - Case-internal exported tests (the `it(...)` inside a case’s `index.js`) are aggregated and executed within that top-level test. Use the `-t` filter on the top-level name to run only that case.


## Submitting Changes

### Add a Changeset

Universe is using [Changesets](https://github.com/changesets/changesets) to manage the versioning and changelogs.

If you've changed some packages, you need add a new changeset for the changes. Please run `changeset` command to select the changed packages and add the changeset info.

```sh
pnpm run changeset
```

![image](https://github.com/module-federation/core/assets/27547179/15505abf-8b0b-450f-b2d0-ffdc52e710a4)


### Committing your Changes

Commit your changes to your forked repo, and [create a pull request](https://help.github.com/articles/creating-a-pull-request/).

### Format of PR titles

The format of PR titles follow Conventional Commits.

An example:

```
feat(plugin-swc): Add `xxx` config
^    ^    ^
|    |    |__ Subject
|    |_______ Scope
|____________ Type
```


## Releasing

Repository maintainers can publish a new version of changed packages to npm.

1. Checkout a new release branch, for example `release-v0.19.0`.
2. Run `pnpm changeset version` in the package directory to update the version of each package.
3. Create a pull request, the title should be `release v0.19.1`.
4. Run the [release action](https://github.com/module-federation/core/actions/workflows/release.yml) to publish packages to npm.
5. Select `latest` as the release version.
6. Wait reviewers to approve. 
7. Merge the release pull request to `main`.
7. Generate the [release notes](https://github.com/module-federation/core/releases) via GitHub, see [Automatically generated release notes](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes)

## Release preview version

1. Make sure your branch has added changeset files before releasing the preview version.
2. Run the [release action](https://github.com/module-federation/core/actions/workflows/release.yml) to publish packages to npm.
3. Select `next` as the release version.
4. Wait reviewers to approve. 


## Release the official version

1. Use the release pull request to release an official version
    * It will create a pull request that includes the changed version
  
![image](https://github.com/module-federation/core/assets/27547179/b5ed83f3-4cf8-4a95-859b-729e3ad0e7eb)
![image](https://github.com/module-federation/core/assets/27547179/1cfc2e71-dbf9-41d8-84f8-3948eb636c7c)



2. If the version is normal, release it using release workflow and then a branch of pull request
![image](https://github.com/module-federation/core/assets/27547179/5c66e9e5-7bd7-4466-a1aa-38420f1dac82)


4. Generate a release note based on the original tag after the release is complete

![image](https://github.com/module-federation/core/assets/27547179/accc9626-9ffd-4074-8d47-14372ae77400)
