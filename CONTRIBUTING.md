# Thanks you for your contribution!

## commits

- must be followed by conventional commits
- could be achieved by using git commitizen (embedded in this repo).

## version release

- to release a version, please follow this command:
  - `nx run PROJECT-NAME:version --releaseAs=MAJOR/MINOR/PATCH`
    - find more options [here](https://github.com/jscutlery/semver#specify-the-level-of-change)
- this command will perform couple of operations.
  - tag your commit with the relevant version.
  - create changelog using semantic commits.
  - bump the version of the project.
  - if other projects depends on the current released project, they will be bumped as well.
  - if case of bumping nextjs-mf project, NPM publish operation will be performed as well.
