# `@module-federation/rspack` Documentation

The experimental `experiments.buildVersion` option accepts a non-empty string or a callback evaluated once per compilation. It keeps the compiled runtime identity and manifest build version aligned across cached watch rebuilds. See the [framework integration contract](../enhanced/README.md#experimentsbuildversion) for scheduling and publication requirements. Without this option, the existing build version behavior is unchanged.
