# Module Federation Contributing Guide

Thank you for your interest in contributing to Module Federation! Before starting your contribution, please take a moment to read the following guidelines.

## Sending a Pull Request

1. [Fork](https://help.github.com/articles/fork-a-repo/) the Module Federation repository into your own GitHub account.
2. [Clone](https://help.github.com/articles/cloning-a-repository/) the repository to your local.
3. Checkout a new branch from `main`.
4. Set up the development environment, you can read the "Setup Development Environment" section below to learn about it.
5. If you've fixed a bug or added codand `pnpm run lint:rs` e that should be tested, then add some tests.
6. Make sure all the tests pass, you can read the "Testing" section below to learn about it.
7. Run `npm run lint-fix` to check the code style.
8. If you've changed some Node.js packages, you should run `npm run commit` to add commit. When release is triggered, the pipeline will automatically update the semantically compliant version based on this commit.
9. Submit the Pull Request, make sure all CI runs pass.
10. The maintainers will review your Pull Request soon.

When submitting a Pull Request, please note the following:

- Keep your PRs small enough, so that each PR only addresses a single issue or adds a single feature.
- Please include an appropriate description in the PR, and link related issues.

## Setup Development Environment

#### Install Node.js

We recommend using the LTS version of Node.js 18. You can check your currently used Node.js version with the following command:

```bash
node -v
#v18.18.2
```

If you do not have Node.js installed in your current environment, you can use [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm) to install it.

Here is an example of how to install the Node.js 18 LTS version via nvm:

```bash
# Install the LTS version of Node.js 18
nvm install 18 --lts

# Make the newly installed Node.js 18 as the default version
nvm alias default 18

# Switch to the newly installed Node.js 18
nvm use 18
```

#### Install Dependencies

Install Node.js dependencies via npm.

```bash
npm install
```
## Testing

You can run all test cases by the follow command: 
```sh
npm run test
```

You can also run specific project test cases by the follow command:
```sh
nx test PROJECT_NAME
```

## Release

To make releasing easier, Module Federation use github action to automate creating versioning pull requests, and optionally publishing packages.

### version release

- to release a version, please follow this command:
  - `nx run PROJECT-NAME:version --releaseAs=MAJOR/MINOR/PATCH`
    - find more options [here](https://github.com/jscutlery/semver#specify-the-level-of-change)
- this command will perform couple of operations.
  - tag your commit with the relevant version.
  - create changelog using semantic commits.
  - bump the version of the project.
  - if other projects depends on the current released project, they will be bumped as well.
  - if case of bumping nextjs-mf project, NPM publish operation will be performed as well.
