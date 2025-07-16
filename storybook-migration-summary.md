# Storybook 9 Migration Summary

## Upgrade Storybook packages

The following command was ran to upgrade the Storybook packages:

```bash
npx storybook@latest upgrade
```

## The Storybook automigration scripts were ran

### Some migrations failed

The following commands failed and your Storybook configuration for these projects was not
migrated to the latest version 9:

- `pnpm dlx storybook automigrate --config-dir apps/reactStorybook/.storybook`

- `pnpm dlx storybook automigrate --config-dir apps/rslib-module/.storybook`

- `pnpm dlx storybook automigrate --config-dir packages/chrome-devtools/.storybook`

You can run these commands again, manually, and follow the instructions in the
output of these commands to migrate your Storybook configuration to the latest version 9.

Also, we may have missed something. Please make sure to check the logs of the Storybook CLI commands that were run, and look for
the `❌ Failed trying to evaluate` message or `❌ The migration failed to update` message. This will indicate if a command was
unsuccessful, and will help you run the migration again, manually.

## Next steps

You can make sure everything is working as expected by trying
to build or serve your Storybook as you normally would.

```bash
npx nx build-storybook project-name
```

```bash
npx nx storybook project-name
```

Please read the [Storybook 9.0.0 migration guide](https://github.com/storybookjs/storybook/blob/next/MIGRATION.md)
for more information.
