# Optimize mf configuration

Optimize by role type.

If mf config `exposes` field has value, can be treated as `Provider` .
If mf config `remotes` field has value, can be treated as `Consumer` .

The project can be both `Provider` and `Consumer`.

## Provider

1. The same shared lib can not be set if frameworkConfig set it as `external`, just keep one.

## Consumer

1. Fetch the remote manifest to get the remote shared config. If all remote manifests fetch failed, stop.
2. If the current mf config has more shared than remote, ask if the extra part is redundant, and remove it if it is redundant.
3. If the remote shared config set `import:false`, and the shared is not set in current mf config, add it.
